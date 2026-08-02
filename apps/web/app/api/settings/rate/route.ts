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

    // Obtener tasa de cambio desde settings
    const response = await fetch(
      `${supabaseUrl}/rest/v1/settings?tenant_id=eq.${tenantId}&key=eq.exchangeRate`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener tasa de cambio' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rate = data.length > 0 ? parseFloat(data[0].value) : 0;

    return NextResponse.json({
      success: true,
      rate: {
        usd: rate,
        eur: rate * 0.92, // Aproximado, o usa servicio externo
        updated_at: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno', message: error.message },
      { status: 500 }
    );
  }
}