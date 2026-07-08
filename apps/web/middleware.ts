import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { locales, defaultLocale, getLocaleFromRequest } from '@/i18n';

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/'];

// Rutas según rol
const ROLE_ROUTES = {
  ADMIN: ['/dashboard/admin', '/api/admin/*'],
  RESIDENT: ['/dashboard/resident', '/api/resident/*'],
  STAFF: ['/dashboard/staff', '/api/staff/*'],
};

// Generar regex para las rutas con locale (ej: /es/login, /en/dashboard/admin)
function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split('/');
  if (segments.length > 1 && locales.includes(segments[1])) {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  // 1. Obtener locale (de URL, headers o default)
  const locale = getLocaleFromRequest(request);
  
  // 2. Si la ruta no tiene locale, redirigir
  const segments = pathname.split('/');
  if (segments.length < 2 || !locales.includes(segments[1])) {
    const newPath = `/${locale}${pathname}`;
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // 3. Permitir rutas públicas
  if (PUBLIC_ROUTES.some(route => pathWithoutLocale.startsWith(route))) {
    return NextResponse.next();
  }

  // 4. Verificar token
  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return redirectToLogin(request, locale);
  }

  // 5. Verificar token con jose
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key');
    const { payload } = await jwtVerify(token, secret);
    
    const userRole = payload.role as string;
    const tenantId = payload.tenantId as string;

    // 6. Verificar acceso según rol
    const allowedRoutes = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES] || [];
    const isAllowed = allowedRoutes.some(route => {
      const routePattern = route.replace('/*', '');
      return pathWithoutLocale.startsWith(routePattern);
    });

    if (!isAllowed && !pathWithoutLocale.startsWith('/dashboard')) {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // 7. Agregar headers con datos del usuario
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id as string);
    requestHeaders.set('x-user-role', userRole);
    requestHeaders.set('x-tenant-id', tenantId);
    requestHeaders.set('x-locale', locale);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    return redirectToLogin(request, locale);
  }
}

function redirectToLogin(request: NextRequest, locale: string) {
  const loginUrl = new URL(`/${locale}/login`, request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};