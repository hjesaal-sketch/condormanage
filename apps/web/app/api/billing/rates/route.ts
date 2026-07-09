import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Integrar con API del BCV
    // Por ahora devolvemos tasa mock
    return NextResponse.json({
      success: true,
      rate: {
        usd: 700.22,
        eur: 760.50,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error en GET /api/billing/rates:', error);
    return NextResponse.json(
      { error: 'Error al obtener tasas de cambio' },
      { status: 500 }
    );
  }
}