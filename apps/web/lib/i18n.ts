import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Definir los locales soportados
export const locales = ['es', 'en', 'pt'];
export const defaultLocale = 'es';

export type Locale = (typeof locales)[number];

// Detectar si un locale es válido
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Obtener el locale del usuario (desde cookies, headers, etc.)
export function getLocaleFromRequest(request: Request): string {
  // 1. Prioridad: URL param (ej: /es/dashboard)
  const url = new URL(request.url);
  const pathLocale = url.pathname.split('/')[1];
  if (isValidLocale(pathLocale)) {
    return pathLocale;
  }

  // 2. Prioridad: Cookie (si el usuario seleccionó idioma)
  // (se implementará luego)

  // 3. Prioridad: Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',')[0].split('-')[0];
    if (isValidLocale(preferred)) {
      return preferred;
    }
  }

  // 4. Default
  return defaultLocale;
}

// Configuración de next-intl para Server Components
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Si no hay locale, usar el default
  if (!locale) {
    locale = defaultLocale;
  }

  // Validar que el locale sea soportado
  if (!isValidLocale(locale)) {
    notFound();
  }

  try {
    // Cargar las traducciones del locale correspondiente
    const messages = (await import(`../messages/${locale}.json`)).default;
    return {
      locale,
      messages,
      // Configuración de formato (fechas, monedas, etc.)
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
    };
  } catch (error) {
    // Si falla la carga del locale, usar el default
    const messages = (await import(`../messages/${defaultLocale}.json`)).default;
    return {
      locale: defaultLocale,
      messages,
    };
  }
});