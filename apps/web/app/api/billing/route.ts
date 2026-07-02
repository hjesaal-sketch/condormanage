import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    console.log('supabaseUrl:', supabaseUrl);
    console.log('supabaseKey existe:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Faltan variables de entorno de Supabase' },
        { status: 500 }
      );
    }

    // Prueba 1: Consulta simple a la tabla invoices
    const response = await fetch(`${supabaseUrl}/rest/v1/invoices?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Respuesta:', text);

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Error en Supabase', 
          status: response.status,
          details: text 
        },
        { status: response.status }
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json({ 
      success: true, 
      count: data.length,
      invoices: data 
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        error: 'Error interno', 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}