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

    // 1. Obtener total de unidades
    const unitsRes = await fetch(
      `${supabaseUrl}/rest/v1/units?tenant_id=eq.${tenantId}&select=id`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const units = await unitsRes.json();

    // 2. Obtener total de residentes
    const residentsRes = await fetch(
      `${supabaseUrl}/rest/v1/residents?tenant_id=eq.${tenantId}&select=id`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const residents = await residentsRes.json();

    // 3. Obtener facturas
    const invoicesRes = await fetch(
      `${supabaseUrl}/rest/v1/invoices?tenant_id=eq.${tenantId}&select=id,amount,status,currency,exchange_rate`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const invoices = await invoicesRes.json();

    // 4. Obtener tasa de cambio desde settings
    const rateRes = await fetch(
      `${supabaseUrl}/rest/v1/settings?tenant_id=eq.${tenantId}&key=eq.exchangeRate`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const rateData = await rateRes.json();
    const exchangeRate = rateData.length > 0 ? parseFloat(rateData[0].value) : 0;

    // 5. Calcular estadísticas
    let totalIncome = 0;
    let totalPending = 0;
    let totalPaid = 0;
    let totalInvoices = invoices.length;

    invoices.forEach((inv: any) => {
      let amount = inv.amount;
      // Si la factura está en VES, convertir a USD para el total
      if (inv.currency === 'VES' && exchangeRate > 0) {
        amount = inv.amount / exchangeRate;
      }
      // Si está en USD y hay tasa, guardamos en USD como base
      if (inv.currency === 'USD') {
        totalIncome += amount;
      } else if (inv.currency === 'VES' && exchangeRate > 0) {
        totalIncome += amount / exchangeRate;
      } else {
        totalIncome += amount; // Si no hay tasa, lo dejamos como está
      }

      if (inv.status === 'PAID') {
        totalPaid += amount;
      } else if (inv.status === 'PENDING') {
        totalPending += amount;
      }
    });

    // 6. Calcular en VES si hay tasa
    const totalIncomeVES = exchangeRate > 0 ? totalIncome * exchangeRate : 0;
    const totalPendingVES = exchangeRate > 0 ? totalPending * exchangeRate : 0;
    const totalPaidVES = exchangeRate > 0 ? totalPaid * exchangeRate : 0;

    return NextResponse.json({
      success: true,
      stats: {
        units: units.length,
        residents: residents.length,
        income: {
          usd: totalIncome,
          ves: totalIncomeVES,
          formatted: {
            usd: `$${totalIncome.toFixed(2)}`,
            ves: `Bs. ${totalIncomeVES.toFixed(2)}`,
          }
        },
        pending: {
          usd: totalPending,
          ves: totalPendingVES,
          formatted: {
            usd: `$${totalPending.toFixed(2)}`,
            ves: `Bs. ${totalPendingVES.toFixed(2)}`,
          }
        },
        paid: {
          usd: totalPaid,
          ves: totalPaidVES,
          formatted: {
            usd: `$${totalPaid.toFixed(2)}`,
            ves: `Bs. ${totalPaidVES.toFixed(2)}`,
          }
        },
        totalInvoices,
        exchangeRate,
        currency: 'USD', // Moneda base
      }
    });
  } catch (error: any) {
    console.error('Error en GET /api/dashboard/stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}