import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    const { payload } = await jwtVerify(token, secret);
    const tenantId = payload.tenantId as string;

    const body = await request.json();
    const { month, year, amount, concept, applyToAll } = body;

    if (!month || !year || !amount) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Obtener unidades activas
    let unitsQuery = `${supabaseUrl}/rest/v1/units?tenant_id=eq.${tenantId}&status=eq.OCCUPIED`;
    if (!applyToAll) {
      unitsQuery += `&id=eq.${body.unitId}`;
    }

    const unitsRes = await fetch(unitsQuery, {
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
      },
    });
    const units = await unitsRes.json();

    const invoices = [];
    for (const unit of units) {
      // Verificar si ya existe factura para esta unidad y mes
      const checkRes = await fetch(
        `${supabaseUrl}/rest/v1/invoices?tenant_id=eq.${tenantId}&unit_id=eq.${unit.id}&extract(month from issue_date)=eq.${month}&extract(year from issue_date)=eq.${year}`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey!}`,
          },
        }
      );
      const existing = await checkRes.json();
      if (existing.length > 0) continue;

      // Generar número de factura
      const countRes = await fetch(
        `${supabaseUrl}/rest/v1/invoices?tenant_id=eq.${tenantId}&issue_date=gte.${year}-${String(month).padStart(2, '0')}-01&issue_date=lt.${year}-${String(month + 1).padStart(2, '0')}-01&select=id`,
        {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey!}`,
          },
        }
      );
      const countData = await countRes.json();
      const number = `${year}${String(month).padStart(2, '0')}${String(countData.length + 1).padStart(4, '0')}`;

      const invoiceData = {
        tenant_id: tenantId,
        unit_id: unit.id,
        number,
        issue_date: `${year}-${String(month).padStart(2, '0')}-01`,
        due_date: `${year}-${String(month).padStart(2, '0')}-15`,
        amount,
        concept: concept || `Cuota de Mantenimiento - ${month}/${year}`,
        status: 'PENDING',
        currency: 'USD',
      };

      const createRes = await fetch(`${supabaseUrl}/rest/v1/invoices`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(invoiceData),
      });
      const result = await createRes.json();
      invoices.push(result[0]);
    }

    return NextResponse.json({
      success: true,
      message: `Generadas ${invoices.length} facturas`,
      invoices,
    });
  } catch (error: any) {
    console.error('Error en POST /api/billing/generate:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}