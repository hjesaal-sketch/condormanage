import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    // Configuración directa de la conexión (NO usa DATABASE_URL)
    const pool = new Pool({
      user: 'postgres',
      password: 'CondorM4n4ge2025!',
      host: '2600:1f18:6f7d:e800:6a76:b8a7:b19f:19d9', // IPv6 sin corchetes
      port: 5432,
      database: 'postgres',
      ssl: {
        rejectUnauthorized: false,
        require: true,
      },
      connectionTimeoutMillis: 15000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    // Probar conexión
    const client = await pool.connect();
    console.log('✅ Conexión establecida a Supabase');

    // Ejecutar consulta
    const result = await client.query('SELECT * FROM invoices ORDER BY created_at DESC LIMIT 50');
    client.release();

    await pool.end();

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      invoices: result.rows,
    });
  } catch (error: any) {
    console.error('Error completo:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener facturas',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}