import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Verificar que la variable existe
    const dbUrl = process.env.DATABASE_URL;
    console.log('DATABASE_URL existe:', !!dbUrl);
    console.log('Primeros 20 caracteres:', dbUrl?.substring(0, 20));

    if (!dbUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL no está configurada' },
        { status: 500 }
      );
    }

    // 2. Extraer la IPv6 de la URL (si está entre corchetes)
    const ipv6Match = dbUrl.match(/\[(.*?)\]/);
    const host = ipv6Match ? ipv6Match[1] : undefined;
    const isIPv6 = !!host;

    console.log('Host detectado:', host || 'No IPv6 detectado');

    // 3. Importar dinámicamente pg
    const { Pool } = await import('pg');

    // 4. Configurar el pool con opciones específicas para IPv6
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      // Si es IPv6, forzar el host y puerto manualmente
      ...(isIPv6 && {
        host,
        port: 5432,
        // Para IPv6, a veces es necesario deshabilitar el DNS lookup
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        connectionTimeoutMillis: 15000,
      }),
      // Parámetros adicionales para estabilidad
      max: 1, // Limitamos a 1 conexión para evitar problemas
      idleTimeoutMillis: 30000,
    });

    // 5. Ejecutar consulta
    const { rows } = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC LIMIT 50');
    await pool.end();

    return NextResponse.json({
      success: true,
      count: rows.length,
      invoices: rows,
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