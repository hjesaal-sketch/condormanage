'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, CreditCard, Wrench, Calendar, Bell, LogOut, Menu, X, FileText, User } from 'lucide-react';

export default function ResidentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'RESIDENT') {
        router.push(`/dashboard/${parsedUser.role.toLowerCase()}`);
        return;
      }
      setUser(parsedUser);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:shadow-lg">
        <div className="flex items-center gap-2 p-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20">
            C
          </div>
          <span className="text-xl font-bold text-gray-800">CondorManage</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <nav className="space-y-1">
            <SidebarItem icon={Home} label="Inicio" active />
            <SidebarItem icon={User} label="Mi Unidad" />
            <SidebarItem icon={CreditCard} label="Mis Facturas" />
            <SidebarItem icon={Wrench} label="Mantenimiento" />
            <SidebarItem icon={Calendar} label="Reservas" />
            <SidebarItem icon={FileText} label="Documentos" />
            <div className="pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-medium shadow-md shadow-blue-500/20">
                  {user?.name?.charAt(0) || 'R'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'Residente'}</p>
                  <p className="text-xs text-gray-500">Residente</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Mi Portal</h1>
            <p className="text-gray-500">Bienvenido, {user?.name || 'Residente'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <ResidentCard icon={CreditCard} title="Cuotas Pendientes" value="2" subtitle="Total: $300.000" color="red" />
            <ResidentCard icon={Wrench} title="Tickets Activos" value="1" subtitle="En revisión" color="orange" />
            <ResidentCard icon={Calendar} title="Reservas" value="3" subtitle="Próxima: Salón Comunal" color="blue" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Últimas Facturas</h3>
              <div className="space-y-3">
                <InvoiceItem concept="Cuota de Mantenimiento" amount="$150.000" status="Pendiente" date="15/06/2026" />
                <InvoiceItem concept="Cuota de Mantenimiento" amount="$150.000" status="Pagada" date="15/05/2026" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Acciones Rápidas</h3>
              <div className="space-y-3">
                <QuickAction icon={Wrench} label="Reportar Mantenimiento" color="orange" />
                <QuickAction icon={Calendar} label="Reservar Área Común" color="blue" />
                <QuickAction icon={CreditCard} label="Pagar Cuotas" color="green" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${active ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </a>
  );
}

function ResidentCard({ icon: Icon, title, value, subtitle, color }: { icon: any; title: string; value: string; subtitle: string; color: string }) {
  const colors = {
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

function InvoiceItem({ concept, amount, status, date }: { concept: string; amount: string; status: string; date: string }) {
  const statusColors = {
    'Pagada': 'bg-green-100 text-green-700',
    'Pendiente': 'bg-yellow-100 text-yellow-700',
    'Vencida': 'bg-red-100 text-red-700',
  };
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
      <div>
        <p className="text-sm font-medium text-gray-700">{concept}</p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-800">{amount}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  const colors = {
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700',
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    green: 'bg-green-50 hover:bg-green-100 text-green-700',
  };
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${colors[color as keyof typeof colors]}`}>
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}