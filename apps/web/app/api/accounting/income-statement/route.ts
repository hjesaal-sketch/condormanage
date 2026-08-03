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

    const url = new URL(request.url);
    const year = url.searchParams.get('year') || new Date().getFullYear().toString();
    const month = url.searchParams.get('month') || (new Date().getMonth() + 1).toString();

    // Obtener balances del período
    const balancesRes = await fetch(
      `${supabaseUrl}/rest/v1/account_balances?tenant_id=eq.${tenantId}&fiscal_year=eq.${year}&period_month=eq.${month}&select=account_id,closing_balance`,
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
      `${supabaseUrl}/rest/v1/chart_of_accounts?tenant_id=eq.${tenantId}&select=id,code,name,type`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    const accounts = await accountsRes.json();

    const income: any[] = [];
    const expenses: any[] = [];

    for (const balance of balances) {
      const account = accounts.find((a: any) => a.id === balance.account_id);
      if (!account) continue;

      const balanceAmount = parseFloat(balance.closing_balance || 0);
      const item = {
        code: account.code,
        name: account.name,
        balance: balanceAmount,
      };

      if (account.type === 'INGRESO') {
        income.push(item);
      } else if (account.type === 'GASTO') {
        expenses.push(item);
      }
    }

    // Ordenar por código
    income.sort((a, b) => a.code.localeCompare(b.code));
    expenses.sort((a, b) => a.code.localeCompare(b.code));

    return NextResponse.json({
      success: true,
      data: {
        income,
        expenses,
      },
    });
  } catch (error: any) {
    console.error('Error en GET /api/accounting/income-statement:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}