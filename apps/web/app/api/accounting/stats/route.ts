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

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const supabaseKey = process.env.SUPABASE_ANON_KEY as string;

    // Obtener balances por tipo de cuenta
    const balancesRes = await fetch(
      `${supabaseUrl}/rest/v1/account_balances?tenant_id=eq.${tenantId}&select=account_id,total_debit,total_credit,closing_balance`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    const balances = await balancesRes.json();

    // Obtener plan de cuentas
    const accountsRes = await fetch(
      `${supabaseUrl}/rest/v1/chart_of_accounts?tenant_id=eq.${tenantId}&select=id,code,type`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    const accounts = await accountsRes.json();

    // Calcular totales por tipo
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const balance of balances) {
      const account = accounts.find((a: any) => a.id === balance.account_id);
      if (!account) continue;

      const balanceAmount = parseFloat(balance.closing_balance || 0);

      switch (account.type) {
        case 'ACTIVO':
          totalAssets += balanceAmount;
          break;
        case 'PASIVO':
          totalLiabilities += balanceAmount;
          break;
        case 'PATRIMONIO':
          totalEquity += balanceAmount;
          break;
        case 'INGRESO':
          totalIncome += balanceAmount;
          break;
        case 'GASTO':
          totalExpenses += balanceAmount;
          break;
      }
    }

    // Obtener facturas pendientes y vencidas
    const invoicesRes = await fetch(
      `${supabaseUrl}/rest/v1/invoices?tenant_id=eq.${tenantId}&select=status,amount,due_date`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    const invoices = await invoicesRes.json();

    let pendingInvoices = 0;
    let overdueInvoices = 0;
    let totalPaid = 0;
    let totalPendingAmount = 0;

    for (const invoice of invoices) {
      if (invoice.status === 'PENDING') {
        pendingInvoices++;
        totalPendingAmount += parseFloat(invoice.amount || 0);
        if (new Date(invoice.due_date) < new Date()) {
          overdueInvoices++;
        }
      } else if (invoice.status === 'PAID') {
        totalPaid += parseFloat(invoice.amount || 0);
      }
    }

    const netIncome = totalIncome - totalExpenses;
    const morosityRate = totalPendingAmount > 0 
      ? (totalPendingAmount / (totalPaid + totalPendingAmount)) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        total_equity: totalEquity,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_income: netIncome,
        pending_invoices: pendingInvoices,
        overdue_invoices: overdueInvoices,
        total_paid: totalPaid,
        morosity_rate: morosityRate,
      },
    });
  } catch (error: any) {
    console.error('Error en GET /api/accounting/stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}