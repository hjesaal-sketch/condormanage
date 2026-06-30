'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { StatsCards } from '@/components/modules/dashboard/StatsCards';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Bienvenido, {session.user?.name || 'Administrador'}</p>
      </div>
      <StatsCards />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📋 Últimas Actividades</h2>
          <div className="space-y-3 text-gray-600">
            <p>• Factura #001 creada para Apartamento 101</p>
            <p>• Pago registrado de Bs. 150.000</p>
            <p>• Nuevo ticket de mantenimiento abierto</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">⚡ Acciones Rápidas</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded">
              Generar Cuotas del Mes
            </button>
            <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded">
              Registrar Pago
            </button>
            <button className="w-full text-left px-4 py-2 bg-yellow-50 hover:bg-yellow-100 rounded">
              Crear Ticket de Mantenimiento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}