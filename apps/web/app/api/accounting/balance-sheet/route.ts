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

    // Obtener balances
    const balancesRes = await fetch(
      `${supabaseUrl}/rest/v1/account_balances?tenant_id=eq.${tenantId}&select=account_id,closing_balance`,
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
      `${supabaseUrl}/rest/v1/chart_of_accounts?tenant_id=eq.${tenantId}&select=id,code,name,type,category`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    const accounts = await accountsRes.json();

    const assets: any[] = [];
    const liabilities: any[] = [];
    const equity: any[] = [];

    for (const balance of balances) {
      const account = accounts.find((a: any) => a.id === balance.account_id);
      if (!account) continue;

      const balanceAmount = parseFloat(balance.closing_balance || 0);
      const item = {
        code: account.code,
        name: account.name,
        balance: balanceAmount,
      };

      switch (account.type) {
        case 'ACTIVO':
          assets.push(item);
          break;
        case 'PASIVO':
          liabilities.push(item);
          break;
        case 'PATRIMONIO':
          equity.push(item);
          break;
      }
    }

    // Ordenar por código
    assets.sort((a, b) => a.code.localeCompare(b.code));
    liabilities.sort((a, b) => a.code.localeCompare(b.code));
    equity.sort((a, b) => a.code.localeCompare(b.code));

    return NextResponse.json({
      success: true,
      data: {
        assets,
        liabilities,
        equity,
      },
    });
  } catch (error: any) {
    console.error('Error en GET /api/accounting/balance-sheet:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}