import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM invoices ORDER BY created_at DESC LIMIT 50'
    );
    return NextResponse.json({ invoices: rows });
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    return NextResponse.json(
      { error: 'Error al obtener facturas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Aquí iría la lógica para crear una factura
    return NextResponse.json({ message: 'Factura creada', data: body });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear factura' },
      { status: 500 }
    );
  }
}