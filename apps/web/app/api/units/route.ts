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

    // Obtener parámetros de filtro
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const floor = url.searchParams.get('floor');

    let query = `${supabaseUrl}/rest/v1/units?select=*,users:unit_user_rel(user_id,relationship,users(name,email))&tenant_id=eq.${tenantId}`;
    
    if (type) query += `&type=eq.${type}`;
    if (status) query += `&status=eq.${status}`;
    if (floor) query += `&floor=eq.${floor}`;

    const response = await fetch(query, {
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al obtener unidades', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, units: data });
  } catch (error: any) {
    console.error('Error en GET /api/units:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    const { payload } = await jwtVerify(token, secret);
    const tenantId = payload.tenantId as string;

    const body = await request.json();
    const { number, floor, area, type, status, bedrooms, bathrooms, parkingSpaces } = body;

    if (!number) {
      return NextResponse.json(
        { error: 'El número de unidad es requerido' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const newUnit = {
      tenant_id: tenantId,
      number,
      floor: floor || null,
      area: area || null,
      type: type || 'APARTMENT',
      status: status || 'AVAILABLE',
      bedrooms: bedrooms || null,
      bathrooms: bathrooms || null,
      parking_spaces: parkingSpaces || 1,
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/units`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(newUnit),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al crear unidad', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, unit: data[0] });
  } catch (error: any) {
    console.error('Error en POST /api/units:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}