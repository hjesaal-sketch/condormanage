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
    const { invoiceId, amount, method, reference, date, currency } = body;

    if (!invoiceId || !amount || !method) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Registrar pago
    const paymentData = {
      invoice_id: invoiceId,
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
        { error: 'Error al registrar pago', details: errorText },
        { status: response.status }
      );
    }

    const paymentDataResult = await response.json();
    const payment = paymentDataResult[0];

    // Actualizar factura a PAID si se pagó el total
    const invoiceRes = await fetch(
      `${supabaseUrl}/rest/v1/invoices?id=eq.${invoiceId}&tenant_id=eq.${tenantId}&select=amount,payments(amount)`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const invoiceData = await invoiceRes.json();
    if (invoiceData && invoiceData.length > 0) {
      const invoice = invoiceData[0];
      const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
      if (totalPaid >= invoice.amount) {
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
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error('Error en POST /api/billing/payments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}