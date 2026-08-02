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

    // Obtener últimas facturas
    const invoicesRes = await fetch(
      `${supabaseUrl}/rest/v1/invoices?tenant_id=eq.${tenantId}&order=created_at.desc&limit=5&select=id,number,amount,status,created_at,unit:units(number)`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const invoices = await invoicesRes.json();

    // Obtener últimos pagos
    const paymentsRes = await fetch(
      `${supabaseUrl}/rest/v1/payments?tenant_id=eq.${tenantId}&order=created_at.desc&limit=5&select=id,amount,method,created_at,invoice:invoices(number)`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const payments = await paymentsRes.json();

    // Obtener últimos tickets de mantenimiento
    const ticketsRes = await fetch(
      `${supabaseUrl}/rest/v1/maintenance_requests?tenant_id=eq.${tenantId}&order=created_at.desc&limit=5&select=id,title,status,created_at,unit:units(number)`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const tickets = await ticketsRes.json();

    // Obtener últimos residentes
    const residentsRes = await fetch(
      `${supabaseUrl}/rest/v1/residents?tenant_id=eq.${tenantId}&order=created_at.desc&limit=5&select=id,name,created_at,unit:units(number)`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey!}`,
        },
      }
    );
    const residents = await residentsRes.json();

    // Construir actividad
    const activities: any[] = [];

    // Facturas
    invoices.forEach((inv: any) => {
      activities.push({
        id: `invoice-${inv.id}`,
        type: 'invoice',
        title: `Factura #${inv.number} creada`,
        description: `Para ${inv.unit?.number || 'Unidad'}`,
        amount: inv.amount,
        status: inv.status,
        time: inv.created_at,
        icon: 'FileText',
        color: 'blue',
      });
    });

    // Pagos
    payments.forEach((pay: any) => {
      activities.push({
        id: `payment-${pay.id}`,
        type: 'payment',
        title: `Pago registrado de $${pay.amount}`,
        description: `Factura #${pay.invoice?.number || ''}`,
        method: pay.method,
        time: pay.created_at,
        icon: 'DollarSign',
        color: 'green',
      });
    });

    // Tickets
    tickets.forEach((ticket: any) => {
      activities.push({
        id: `ticket-${ticket.id}`,
        type: 'ticket',
        title: `Ticket #${ticket.id} ${ticket.title}`,
        description: `Unidad ${ticket.unit?.number || ''}`,
        status: ticket.status,
        time: ticket.created_at,
        icon: 'Wrench',
        color: 'orange',
      });
    });

    // Residentes
    residents.forEach((resident: any) => {
      activities.push({
        id: `resident-${resident.id}`,
        type: 'resident',
        title: `Nuevo residente: ${resident.name}`,
        description: `Unidad ${resident.unit?.number || ''}`,
        time: resident.created_at,
        icon: 'Users',
        color: 'purple',
      });
    });

    // Ordenar por fecha (más reciente primero)
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Tomar solo los 4 más recientes
    const recentActivities = activities.slice(0, 4);

    return NextResponse.json({
      success: true,
      activities: recentActivities,
    });
  } catch (error: any) {
    console.error('Error en GET /api/dashboard/activity:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}