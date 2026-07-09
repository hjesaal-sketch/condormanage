import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    const { payload } = await jwtVerify(token, secret);
    const tenantId = payload.tenantId as string;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';
    const unitId = url.searchParams.get('unitId') || '';
    const month = url.searchParams.get('month') || '';
    const year = url.searchParams.get('year') || '';

    let query = `${supabaseUrl}/rest/v1/invoices?select=*,unit:units(number,tenant_id),payments(*)&tenant_id=eq.${tenantId}&order=issue_date.desc`;
    if (status) query += `&status=eq.${status}`;
    if (unitId) query += `&unit_id=eq.${unitId}`;
    if (month) query += `&extract(month from issue_date)=eq.${month}`;
    if (year) query += `&extract(year from issue_date)=eq.${year}`;

    const response = await fetch(query, {
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al obtener facturas', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, invoices: data });
  } catch (error: any) {
    console.error('Error en GET /api/billing:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}

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
    const { unitId, issueDate, dueDate, concept, amount, currency, exchangeRate, items } = body;

    if (!unitId || !issueDate || !dueDate || !amount) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Generar número de factura
    const date = new Date(issueDate);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
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

    // Crear factura
    const newInvoice = {
      tenant_id: tenantId,
      unit_id: unitId,
      number,
      issue_date: issueDate,
      due_date: dueDate,
      amount,
      concept,
      status: 'PENDING',
      currency: currency || 'USD',
      exchange_rate: exchangeRate || null,
      metadata: { items: items || [] },
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/invoices`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(newInvoice),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al crear factura', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, invoice: data[0] });
  } catch (error: any) {
    console.error('Error en POST /api/billing:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}