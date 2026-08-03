import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getApiMessage } from '@/lib/api-messages';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: getApiMessage('es', 'unauthorized') },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    const { payload } = await jwtVerify(token, secret);
    const tenantId = payload.tenantId as string;
    const userId = payload.id as string;
    const locale = (payload.locale as string) || 'es';

    const body = await request.json();
    const { month, year, amount, concept, applyToAll } = body;

    if (!month || !year || !amount) {
      return NextResponse.json(
        { error: getApiMessage(locale, 'missing_fields') },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const supabaseKey = process.env.SUPABASE_ANON_KEY as string;

    let unitsQuery = `${supabaseUrl}/rest/v1/units?tenant_id=eq.${tenantId}&status=eq.OCCUPIED`;
    if (!applyToAll) {
      unitsQuery += `&id=eq.${body.unitId}`;
    }

    const unitsRes = await fetch(unitsQuery, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    const units = await unitsRes.json();

    const accountsRes = await fetch(
      `${supabaseUrl}/rest/v1/chart_of_accounts?tenant_id=eq.${tenantId}&or=(code.eq.4-01-001,code.eq.1-02-001)&select=id,code`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    const accounts = await accountsRes.json();
    const incomeAccount = accounts.find((a: any) => a.code === '4-01-001')?.id;
    const receivableAccount = accounts.find((a: any) => a.code === '1-02-001')?.id;

    const invoices = [];
    for (const unit of units) {
      const checkRes = await fetch(
        `${supabaseUrl}/rest/v1/invoices?tenant_id=eq.${tenantId}&unit_id=eq.${unit.id}&extract(month from issue_date)=eq.${month}&extract(year from issue_date)=eq.${year}`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      const existing = await checkRes.json();
      if (existing.length > 0) continue;

      const countRes = await fetch(
        `${supabaseUrl}/rest/v1/invoices?tenant_id=eq.${tenantId}&issue_date=gte.${year}-${String(month).padStart(2, '0')}-01&issue_date=lt.${year}-${String(month + 1).padStart(2, '0')}-01&select=id`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
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
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(invoiceData),
      });
      const result = await createRes.json();
      const invoice = result[0];
      invoices.push(invoice);

      if (incomeAccount && receivableAccount) {
        const entryLines = [
          {
            account_id: receivableAccount,
            unit_id: unit.id,
            description: `Factura ${invoice.number} - ${concept || 'Cuota de Mantenimiento'}`,
            debit: amount,
            credit: 0,
          },
          {
            account_id: incomeAccount,
            description: `Factura ${invoice.number} - ${concept || 'Cuota de Mantenimiento'}`,
            debit: 0,
            credit: amount,
          },
        ];

        await fetch(`${supabaseUrl}/rest/v1/accounting_entries`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            entry_date: `${year}-${String(month).padStart(2, '0')}-01`,
            description: `Factura ${invoice.number} - ${concept || 'Cuota de Mantenimiento'}`,
            reference_type: 'INVOICE',
            reference_id: invoice.id,
            status: 'POSTED',
            created_by: userId,
            posted_at: new Date().toISOString(),
            lines: entryLines,
          }),
        });
      }
    }

    const message = invoices.length === 1
      ? getApiMessage(locale, 'invoice_generated')
      : getApiMessage(locale, 'invoices_generated');

    return NextResponse.json({
      success: true,
      message: `${message} (${invoices.length})`,
      invoices,
    });
  } catch (error: any) {
    console.error('Error en POST /api/billing/generate:', error);
    return NextResponse.json(
      { error: getApiMessage('es', 'server_error'), message: error.message },
      { status: 500 }
    );
  }
}