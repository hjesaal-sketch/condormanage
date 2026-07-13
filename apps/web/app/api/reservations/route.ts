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
    const areaId = url.searchParams.get('areaId') || '';

    let query = `${supabaseUrl}/rest/v1/reservations?select=*,area:common_areas(name,capacity),unit:units(number),user:users(name,email)&tenant_id=eq.${tenantId}&order=date.desc`;
    
    // Si es RESIDENT, solo ver sus reservas
    if (userRole === 'RESIDENT') {
      query += `&user_id=eq.${userId}`;
    }
    
    if (status) query += `&status=eq.${status}`;
    if (areaId) query += `&area_id=eq.${areaId}`;

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
        { error: 'Error al obtener reservas', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, reservations: data });
  } catch (error: any) {
    console.error('Error en GET /api/reservations:', error);
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
    const { areaId, unitId, date, startTime, endTime, notes } = body;

    if (!areaId || !unitId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Área, unidad, fecha, hora de inicio y fin son requeridos' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Verificar disponibilidad
    const checkRes = await fetch(
      `${supabaseUrl}/rest/v1/reservations?area_id=eq.${areaId}&date=eq.${date}&tenant_id=eq.${tenantId}&status=neq.CANCELLED`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const existing = await checkRes.json();

    // Verificar solapamiento de horarios (simplificado)
    const hasConflict = existing.some((r: any) => {
      return (startTime < r.end_time && endTime > r.start_time);
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: 'El área ya está reservada en ese horario' },
        { status: 409 }
      );
    }

    // Obtener área para verificar si requiere aprobación
    const areaRes = await fetch(
      `${supabaseUrl}/rest/v1/common_areas?id=eq.${areaId}&tenant_id=eq.${tenantId}`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const areaData = await areaRes.json();
    const requiresApproval = areaData[0]?.requires_approval || false;

    const newReservation = {
      tenant_id: tenantId,
      area_id: areaId,
      unit_id: unitId,
      user_id: userId,
      date,
      start_time: startTime,
      end_time: endTime,
      status: requiresApproval ? 'PENDING' : 'APPROVED',
      notes: notes || null,
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/reservations`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(newReservation),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al crear reserva', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, reservation: data[0] });
  } catch (error: any) {
    console.error('Error en POST /api/reservations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}