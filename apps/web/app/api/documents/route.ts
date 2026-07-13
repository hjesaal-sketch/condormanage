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
    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';

    let query = `${supabaseUrl}/rest/v1/documents?tenantId=eq.${tenantId}&order=createdAt.desc`;
    
    // Si es residente, solo ve públicos y sus propios documentos
    if (userRole === 'RESIDENT') {
      query += `&or=(isPublic.eq.true,residentId.eq.${userId})`;
    }
    
    if (category) query += `&category=eq.${category}`;
    if (search) {
      query += `&or=(title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}})`;
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
        { error: 'Error al obtener documentos', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, documents: data });
  } catch (error: any) {
    console.error('Error en GET /api/documents:', error);
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
    const { 
      title, 
      description, 
      fileUrl, 
      fileSize, 
      mimeType, 
      category, 
      tags, 
      isPublic, 
      residentId,
      isGenerated,
      relatedEntityId,
      relatedEntityType 
    } = body;

    if (!title || !fileUrl) {
      return NextResponse.json(
        { error: 'Título y URL del archivo son requeridos' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    const newDocument = {
      tenantId,
      title,
      description: description || null,
      fileUrl,
      fileSize: fileSize || null,
      mimeType: mimeType || null,
      category: category || 'GENERAL',
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      isGenerated: isGenerated || false,
      residentId: residentId || null,
      relatedEntityId: relatedEntityId || null,
      relatedEntityType: relatedEntityType || null,
      uploaderId: userId,
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/documents`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey!}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(newDocument),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Supabase:', errorText);
      return NextResponse.json(
        { error: 'Error al crear documento', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, document: data[0] });
  } catch (error: any) {
    console.error('Error en POST /api/documents:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', message: error.message },
      { status: 500 }
    );
  }
}