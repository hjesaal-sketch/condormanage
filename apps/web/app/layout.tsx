import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './output.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CondorManage - Gestión de Condominios',
  description: 'Plataforma SaaS para gestión de condominios',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}