import { getRequestConfig } from 'next-intl/server';

// ============================================
// EXPORTACIONES PARA MIDDLEWARE Y LAYOUTS
// ============================================
export const locales = ['es', 'en', 'pt'];
export const defaultLocale = 'es';

export type Locale = (typeof locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromRequest(request: Request): string {
  const url = new URL(request.url);
  const pathLocale = url.pathname.split('/')[1];
  if (isValidLocale(pathLocale)) {
    return pathLocale;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',')[0].split('-')[0];
    if (isValidLocale(preferred)) {
      return preferred;
    }
  }

  return defaultLocale;
}

// ============================================
// CONFIGURACIÓN DE NEXT-INTL (default export)
// ============================================
export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
  timeZone: 'America/Caracas',
  formats: {
    number: {
      currency: {
        style: 'currency',
        currency: 'USD',
      },
    },
    dateTime: {
      long: {
        dateStyle: 'full',
        timeStyle: 'short',
      },
      short: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
    },
  },
}));