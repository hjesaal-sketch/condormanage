import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          CondorManage
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Gestión inteligente para tu condominio
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/login">
            <Button size="lg" className="text-lg px-8">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Registrarse
            </Button>
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="font-semibold text-xl mb-2">🏢 Gestión</h3>
            <p className="text-gray-600">Administra apartamentos, residentes y cuotas</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="font-semibold text-xl mb-2">📊 Reportes</h3>
            <p className="text-gray-600">Visualiza finanzas y morosidad en tiempo real</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h3 className="font-semibold text-xl mb-2">🔔 Notificaciones</h3>
            <p className="text-gray-600">Comunicación efectiva con todos los residentes</p>
          </div>
        </div>
      </div>
    </div>
  );
}