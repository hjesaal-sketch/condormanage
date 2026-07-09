'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  DollarSign, 
  Wrench,
  Settings,
  FileText,
  Calendar,
  Bell,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const t = useTranslations('dashboard.admin');
  const commonT = useTranslations('common');
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
      if (parsedUser.role !== 'ADMIN') {
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
    router.push(`/${locale}/login`);
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
      {/* Sidebar - Móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
              <span className="text-xl font-bold text-gray-800">CondorManage</span>
            </div>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <SidebarContent t={t} commonT={commonT} user={user} handleLogout={handleLogout} />
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:shadow-lg">
        <div className="flex items-center gap-2 p-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20">
            C
          </div>
          <span className="text-xl font-bold text-gray-800">CondorManage</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <SidebarContent t={t} commonT={commonT} user={user} handleLogout={handleLogout} />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1">
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
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'Administrador'}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
            <p className="text-gray-500">{t('welcome')}, {user?.name || 'Administrador'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Building2} title={t('properties')} value="20" change="+2" color="blue" />
            <StatCard icon={Users} title={t('residents')} value="45" change="+5" color="green" />
            <StatCard icon={DollarSign} title={t('income')} value="$12,500" change="+8%" color="purple" />
            <StatCard icon={Wrench} title={t('maintenance')} value="3" change="-" color="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('recent_activity')}</h3>
              <div className="space-y-4">
                <ActivityItem icon={FileText} text={t('activity.factura')} time={t('activity.hace_2h')} />
                <ActivityItem icon={DollarSign} text={t('activity.pago')} time={t('activity.hace_4h')} />
                <ActivityItem icon={Wrench} text={t('activity.ticket')} time={t('activity.hace_6h')} />
                <ActivityItem icon={Users} text={t('activity.residente')} time={t('activity.hace_1d')} />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('quick_actions')}</h3>
              <div className="space-y-3">
                <QuickAction icon={FileText} label={t('generate_fees')} color="blue" />
                <QuickAction icon={DollarSign} label={t('register_payment')} color="green" />
                <QuickAction icon={Wrench} label={t('create_ticket')} color="orange" />
                <QuickAction icon={Calendar} label={t('reserve_area')} color="purple" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ t, commonT, user, handleLogout }: { t: any; commonT: any; user: any; handleLogout: () => void }) {
  return (
    <nav className="space-y-1">
      <SidebarItem icon={LayoutDashboard} label={t('title')} href="/dashboard/admin" active />
      <SidebarItem icon={Building2} label={commonT('units')} href="/dashboard/admin/units" />
      <SidebarItem icon={Building2} label={t('properties')} href="/dashboard/admin/properties" />
      <SidebarItem icon={Users} label={t('residents')} href="/dashboard/admin/residents" />
      <SidebarItem icon={DollarSign} label={t('income')} href="/dashboard/admin/billing" />
      <SidebarItem icon={Wrench} label={t('maintenance')} href="/dashboard/admin/maintenance" />
      <SidebarItem icon={Calendar} label={commonT('reservations')} href="/dashboard/admin/reservations" />
      <SidebarItem icon={FileText} label={commonT('documents')} href="/dashboard/admin/documents" />
      <SidebarItem icon={Settings} label={commonT('settings')} href="/dashboard/admin/settings" />
      <div className="pt-6 mt-6 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{commonT('logout')}</span>
        </button>
      </div>
    </nav>
  );
}

function SidebarItem({ icon: Icon, label, href, active = false }: { icon: any; label: string; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${active ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}

function StatCard({ icon: Icon, title, value, change, color }: { icon: any; title: string; value: string; change: string; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : change.startsWith('-') ? 'text-gray-400' : 'text-gray-400'}`}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
}

function ActivityItem({ icon: Icon, text, time }: { icon: any; text: string; time: string }) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-700">{text}</p>
        <p className="text-xs text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  const colors = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    green: 'bg-green-50 hover:bg-green-100 text-green-700',
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
  };
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${colors[color as keyof typeof colors]}`}>
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}