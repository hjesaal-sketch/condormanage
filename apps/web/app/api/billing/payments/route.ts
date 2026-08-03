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
    const locale = payload.locale || 'es';

    const body = await request.json();
    const { invoiceId, amount, method, reference, date, currency } = body;

    if (!invoiceId || !amount || !method) {
      return NextResponse.json(
        { error: getApiMessage(locale, 'missing_fields') },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const invoiceRes = await fetch(
      `${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}&tenant_id=eq.${tenantId}&select=amount,unit_id,currency,exchange_rate`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const invoiceData = await invoiceRes.json();
    if (!invoiceData || invoiceData.length === 0) {
      return NextResponse.json(
        { error: getApiMessage(locale, 'not_found') },
        { status: 404 }
      );
    }
    const invoice = invoiceData[0];

    const paymentData = {
      invoice_id: invoiceId,
      tenant_id: tenantId,
      amount,
      date: date || new Date().toISOString(),
      method,
      reference: reference || null,
      status: 'COMPLETED',
      currency: currency || 'USD',
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/payments`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: getApiMessage(locale, 'server_error'), details: errorText },
        { status: response.status }
      );
    }

    const paymentDataResult = await response.json();
    const payment = paymentDataResult[0];

    const accountsRes = await fetch(
      `${supabaseUrl}/rest/v1/chart_of_accounts?tenant_id=eq.${tenantId}&or=(code.eq.1-01-001,code.eq.1-02-001)&select=id,code`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const accounts = await accountsRes.json();
    const cashAccount = accounts.find((a: any) => a.code === '1-01-001')?.id;
    const receivableAccount = accounts.find((a: any) => a.code === '1-02-001')?.id;

    if (cashAccount && receivableAccount) {
      const entryLines = [
        {
          account_id: cashAccount,
          description: `Pago de factura ${invoiceId}`,
          debit: amount,
          credit: 0,
        },
        {
          account_id: receivableAccount,
          description: `Pago de factura ${invoiceId}`,
          debit: 0,
          credit: amount,
        },
      ];

      await fetch(`${supabaseUrl}/rest/v1/accounting_entries`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          entry_date: new Date().toISOString().split('T')[0],
          description: `Pago de factura ${invoiceId}`,
          reference_type: 'PAYMENT',
          reference_id: payment.id,
          status: 'POSTED',
          created_by: userId,
          posted_at: new Date().toISOString(),
          lines: entryLines,
        }),
      });
    }

    const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
    if (totalPaid + amount >= invoice.amount) {
      await fetch(
        `${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}&tenant_id=eq.${tenantId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey!}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'PAID' }),
        }
      );
    }

    return NextResponse.json({
      success: true,
      payment,
      message: getApiMessage(locale, 'payment_success'),
    });
  } catch (error: any) {
    console.error('Error en POST /api/billing/payments:', error);
    return NextResponse.json(
      { error: getApiMessage('es', 'server_error'), message: error.message },
      { status: 500 }
    );
  }
}