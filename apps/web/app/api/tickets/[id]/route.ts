import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      `${supabaseUrl}/rest/v1/maintenance_tickets?id=eq.${params.id}&tenant_id=eq.${tenantId}&select=*,unit:units(number,floor,type),user:users(name,email),assigned_to_user:users!assigned_to(name,email)`,
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
        { error: 'Error al obtener ticket', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket: data[0] });
  } catch (error: any) {
    console.error('Error en GET /api/tickets/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    const { payload } = await jwtVerify(token, secret);
    const tenantId = payload.tenantId as string;

    const body = await request.json();
    const { status, priority, assignedTo } = body;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/maintenance_tickets?id=eq.${params.id}&tenant_id=eq.${tenantId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al actualizar ticket', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, ticket: data[0] });
  } catch (error: any) {
    console.error('Error en PUT /api/tickets/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      `${supabaseUrl}/rest/v1/maintenance_tickets?id=eq.${params.id}&tenant_id=eq.${tenantId}`,
      {
        method: 'DELETE',
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
        { error: 'Error al eliminar ticket', details: errorText },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Ticket eliminado correctamente' });
  } catch (error: any) {
    console.error('Error en DELETE /api/tickets/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}