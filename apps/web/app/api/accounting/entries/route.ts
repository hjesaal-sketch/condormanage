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
    const userId = payload.id as string;

    const body = await request.json();
    const { entry_date, description, reference_type, reference_id, lines } = body;

    if (!entry_date || !lines || lines.length === 0) {
      return NextResponse.json(
        { error: 'Fecha y líneas son requeridas' },
        { status: 400 }
      );
    }

    // Validar que débitos = créditos
    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of lines) {
      totalDebit += parseFloat(line.debit || 0);
      totalCredit += parseFloat(line.credit || 0);
    }

    if (totalDebit !== totalCredit) {
      return NextResponse.json(
        { error: 'Los débitos y créditos no cuadran' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Crear el asiento
    const entryData = {
      tenant_id: tenantId,
      entry_date,
      description: description || null,
      reference_type: reference_type || 'MANUAL',
      reference_id: reference_id || null,
      status: 'POSTED',
      created_by: userId,
      posted_at: new Date().toISOString(),
    };

    const entryResponse = await fetch(`${supabaseUrl}/rest/v1/accounting_entries`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(entryData),
    });

    if (!entryResponse.ok) {
      const errorText = await entryResponse.text();
      console.error('Error al crear asiento:', errorText);
      return NextResponse.json(
        { error: 'Error al crear asiento contable', details: errorText },
        { status: entryResponse.status }
      );
    }

    const entryResult = await entryResponse.json();
    const entryId = entryResult[0].id;

    // Crear las líneas del asiento
    const linePromises = lines.map((line: any) => {
      const lineData = {
        entry_id: entryId,
        account_id: line.account_id,
        unit_id: line.unit_id || null,
        description: line.description || null,
        debit: line.debit || 0,
        credit: line.credit || 0,
      };

      return fetch(`${supabaseUrl}/rest/v1/accounting_entry_lines`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(lineData),
      });
    });

    await Promise.all(linePromises);

    // Actualizar balances
    await updateBalances(tenantId, entry_date, lines, supabaseUrl, supabaseKey);

    return NextResponse.json({
      success: true,
      entry: entryResult[0],
      message: 'Asiento contable creado correctamente',
    });
  } catch (error: any) {
    console.error('Error en POST /api/accounting/entries:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}

async function updateBalances(
  tenantId: string,
  entryDate: string,
  lines: any[],
  supabaseUrl: string,
  supabaseKey: string
) {
  const date = new Date(entryDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  for (const line of lines) {
    const accountId = line.account_id;
    const unitId = line.unit_id || null;
    const debit = parseFloat(line.debit || 0);
    const credit = parseFloat(line.credit || 0);

    // Buscar balance existente
    let query = `${supabaseUrl}/rest/v1/account_balances?tenant_id=eq.${tenantId}&account_id=eq.${accountId}&fiscal_year=eq.${year}&period_month=eq.${month}`;
    if (unitId) {
      query += `&unit_id=eq.${unitId}`;
    } else {
      query += `&unit_id=is.null`;
    }

    const balanceRes = await fetch(query, {
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
      },
    });
    const balanceData = await balanceRes.json();

    if (balanceData && balanceData.length > 0) {
      // Actualizar balance existente
      const balance = balanceData[0];
      const newTotalDebit = parseFloat(balance.total_debit || 0) + debit;
      const newTotalCredit = parseFloat(balance.total_credit || 0) + credit;
      const newClosingBalance = parseFloat(balance.opening_balance || 0) + newTotalDebit - newTotalCredit;

      await fetch(
        `${supabaseUrl}/rest/v1/account_balances?id=eq.${balance.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey!}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total_debit: newTotalDebit,
            total_credit: newTotalCredit,
            closing_balance: newClosingBalance,
            updated_at: new Date().toISOString(),
          }),
        }
      );
    } else {
      // Crear nuevo balance
      const openingBalance = await getOpeningBalance(
        tenantId,
        accountId,
        unitId,
        year,
        month,
        supabaseUrl,
        supabaseKey
      );

      const newBalance = {
        tenant_id: tenantId,
        account_id: accountId,
        unit_id: unitId,
        fiscal_year: year,
        period_month: month,
        opening_balance: openingBalance,
        total_debit: debit,
        total_credit: credit,
        closing_balance: openingBalance + debit - credit,
        updated_at: new Date().toISOString(),
      };

      await fetch(`${supabaseUrl}/rest/v1/account_balances`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBalance),
      });
    }
  }
}

async function getOpeningBalance(
  tenantId: string,
  accountId: string,
  unitId: string | null,
  year: number,
  month: number,
  supabaseUrl: string,
  supabaseKey: string
): Promise<number> {
  // Si es enero, el opening balance es 0
  if (month === 1) {
    return 0;
  }

  // Buscar balance del mes anterior
  let query = `${supabaseUrl}/rest/v1/account_balances?tenant_id=eq.${tenantId}&account_id=eq.${accountId}&fiscal_year=eq.${year}&period_month=eq.${month - 1}`;
  if (unitId) {
    query += `&unit_id=eq.${unitId}`;
  } else {
    query += `&unit_id=is.null`;
  }

  const balanceRes = await fetch(query, {
    headers: {
      'apikey': supabaseKey!,
      'Authorization': `Bearer ${supabaseKey!}`,
    },
  });
  const balanceData = await balanceRes.json();

  if (balanceData && balanceData.length > 0) {
    return parseFloat(balanceData[0].closing_balance || 0);
  }

  return 0;
}