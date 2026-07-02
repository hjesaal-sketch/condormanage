import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // LOGS PARA DEBUG
    console.log('=== DEBUG ENV VARS ===');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);
    console.log('SUPABASE_ANON_KEY length:', process.env.SUPABASE_ANON_KEY?.length);
    console.log('=======================');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          error: 'Faltan variables de entorno de Supabase',
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        },
        { status: 500 }
      );
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/invoices?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al obtener facturas desde Supabase', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, invoices: data });
  } catch (error: any) {
    console.error('Error en la API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}