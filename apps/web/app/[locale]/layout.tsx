import { NextIntlClientProvider, useMessages } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales, isValidLocale } from '@/lib/i18n';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CondorManage',
  description: 'Sistema de gestión de condominios',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  // Validar que el locale sea soportado
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Cargar las traducciones
  const messages = require(`@/messages/${locale}.json`);

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="America/Caracas"
        >
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}