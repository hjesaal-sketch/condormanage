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

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';

    let query = `${supabaseUrl}/rest/v1/users?select=*,unit_user_rel(unit_id,relationship,start_date,end_date)&tenant_id=eq.${tenantId}&role=eq.RESIDENT`;
    
    if (search) {
      query += `&or=(name.ilike.%${search}%,email.ilike.%${search}%)`;
    }

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
        { error: 'Error al obtener residentes', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, residents: data });
  } catch (error: any) {
    console.error('Error en GET /api/residents:', error);
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
    const { name, email, phone, document, unitId, relationship } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // 1. Crear usuario
    const newUser = {
      tenant_id: tenantId,
      name,
      email,
      phone: phone || null,
      document: document || null,
      role: 'RESIDENT',
      is_active: true,
      language: 'es',
    };

    const userResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(newUser),
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al crear residente', details: errorText },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    const userId = userData[0].id;

    // 2. Asignar a unidad si se proporciona
    if (unitId) {
      const relData = {
        unit_id: unitId,
        user_id: userId,
        relationship: relationship || 'RESIDENT',
        start_date: new Date().toISOString(),
        is_primary: true,
      };

      await fetch(`${supabaseUrl}/rest/v1/unit_user_rel`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(relData),
      });

      // Actualizar estado de la unidad
      await fetch(`${supabaseUrl}/rest/v1/units?id=eq.${unitId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'OCCUPIED' }),
      });
    }

    return NextResponse.json({ success: true, resident: userData[0] });
  } catch (error: any) {
    console.error('Error en POST /api/residents:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}