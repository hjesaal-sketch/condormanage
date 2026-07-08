import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/'];

// Rutas según rol
const ROLE_ROUTES = {
  ADMIN: ['/dashboard/admin', '/api/admin/*'],
  RESIDENT: ['/dashboard/resident', '/api/resident/*'],
  STAFF: ['/dashboard/staff', '/api/staff/*'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permitir rutas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. Obtener token de las cookies o headers
  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return redirectToLogin(request);
  }

  // 3. Verificar token
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    const userRole = payload.role as string;
    const tenantId = payload.tenantId as string;

    // 4. Verificar que el tenant esté activo (opcional)
    // Aquí podrías consultar a Supabase si el tenant está activo

    // 5. Verificar acceso según rol
    const allowedRoutes = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || [];
    const isAllowed = allowedRoutes.some(route => {
      if (route.endsWith('/*')) {
        const baseRoute = route.replace('/*', '');
        return pathname.startsWith(baseRoute);
      }
      return pathname === route;
    });

    // Si la ruta no está en las rutas permitidas para su rol
    if (!isAllowed && !pathname.startsWith('/dashboard')) {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // 6. Agregar datos del usuario a la request para los componentes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id as string);
    requestHeaders.set('x-user-role', userRole);
    requestHeaders.set('x-tenant-id', tenantId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // Token inválido o expirado
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};