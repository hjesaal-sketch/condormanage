import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar que la variable existe
    const dbUrl = process.env.DATABASE_URL;
    console.log('DATABASE_URL existe:', !!dbUrl);
    console.log('Primeros 20 caracteres:', dbUrl?.substring(0, 20));

    if (!dbUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL no está configurada' },
        { status: 500 }
      );
    }

    // Intentar conectar usando la URL directamente
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    const { rows } = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC LIMIT 50');
    await pool.end();

    return NextResponse.json({ 
      success: true, 
      count: rows.length,
      invoices: rows 
    });
  } catch (error: any) {
    console.error('Error completo:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener facturas',
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}