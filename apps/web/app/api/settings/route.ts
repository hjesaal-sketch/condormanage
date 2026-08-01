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

    const response = await fetch(
      `${supabaseUrl}/rest/v1/settings?tenant_id=eq.${tenantId}`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al obtener configuración', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Convertir array a objeto clave-valor
    const settings: Record<string, any> = {};
    data.forEach((item: any) => {
      settings[item.key] = item.value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error en GET /api/settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    const { payload } = await jwtVerify(token, secret);
    const tenantId = payload.tenantId as string;

    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'La clave es requerida' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Verificar si existe
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/settings?tenant_id=eq.${tenantId}&key=eq.${key}`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const existing = await checkRes.json();

    let response;
    if (existing && existing.length > 0) {
      // Actualizar
      response = await fetch(
        `${supabaseUrl}/rest/v1/settings?id=eq.${existing[0].id}&tenant_id=eq.${tenantId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey!}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({ value }),
        }
      );
    } else {
      // Crear
      response = await fetch(`${supabaseUrl}/rest/v1/settings`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          key,
          value,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al guardar configuración', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, setting: data[0] });
  } catch (error: any) {
    console.error('Error en PUT /api/settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}