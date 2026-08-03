import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getApiMessage } from '@/lib/api-messages';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: getApiMessage('es', 'missing_fields') },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: getApiMessage('es', 'config_error') },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/users?email=eq.${email}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Error en Supabase:', await response.text());
      return NextResponse.json(
        { error: getApiMessage('es', 'server_error') },
        { status: 500 }
      );
    }

    const users = await response.json();

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: getApiMessage('es', 'invalid_credentials') },
        { status: 401 }
      );
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: getApiMessage('es', 'invalid_credentials') },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenant_id,
        locale: user.language || 'es',
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenant_id,
        language: user.language || 'es',
      },
    });

  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: getApiMessage('es', 'server_error'), details: error.message },
      { status: 500 }
    );
  }
}