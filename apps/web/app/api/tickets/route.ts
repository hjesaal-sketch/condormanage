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
    const userRole = payload.role as string;
    const userId = payload.id as string;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || '';
    const priority = url.searchParams.get('priority') || '';

    let query = `${supabaseUrl}/rest/v1/maintenance_tickets?select=*,unit:units(number,floor,type),user:users(name,email),assigned_to_user:users!assigned_to(name,email)&tenant_id=eq.${tenantId}&order=created_at.desc`;
    
    // Si es STAFF, solo ver sus tickets asignados
    if (userRole === 'STAFF') {
      query += `&assigned_to=eq.${userId}`;
    }
    
    if (status) query += `&status=eq.${status}`;
    if (priority) query += `&priority=eq.${priority}`;

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
        { error: 'Error al obtener tickets', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, tickets: data });
  } catch (error: any) {
    console.error('Error en GET /api/tickets:', error);
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
    const userId = payload.id as string;

    const body = await request.json();
    const { unitId, title, description, priority, assignedTo } = body;

    if (!unitId || !title || !description) {
      return NextResponse.json(
        { error: 'Unidad, título y descripción son requeridos' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const newTicket = {
      tenant_id: tenantId,
      unit_id: unitId,
      user_id: userId,
      title,
      description,
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      assigned_to: assignedTo || null,
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/maintenance_tickets`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(newTicket),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al crear ticket', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, ticket: data[0] });
  } catch (error: any) {
    console.error('Error en POST /api/tickets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}