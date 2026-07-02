import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Faltan variables de entorno de Supabase' },
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
    return NextResponse.json(
      { success: true, invoices: data },
      { 
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error: any) {
    console.error('Error en la API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}