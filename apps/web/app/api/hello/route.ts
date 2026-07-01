import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Backend funcionando en Vercel!',
    timestamp: new Date().toISOString()
  });
}