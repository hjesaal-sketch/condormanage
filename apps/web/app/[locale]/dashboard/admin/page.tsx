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
  LogOut,
  Server,
  CreditCard
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const t = useTranslations('dashboard.admin');
  const commonT = useTranslations('common');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
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
      fetchDashboardData(token);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      // Obtener estadísticas
      const statsRes = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Obtener actividad reciente
      const activityRes = await fetch('/api/dashboard/activity', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const activityData = await activityRes.json();
      if (activityData.success) {
        setActivities(activityData.activities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push(`/${locale}/login`);
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'Hace un momento';
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
          <SidebarContent t={t} commonT={commonT} user={user} handleLogout={handleLogout} locale={locale} />
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
          <SidebarContent t={t} commonT={commonT} user={user} handleLogout={handleLogout} locale={locale} />
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
            <StatCard 
              icon={Building2} 
              title={t('properties')} 
              value={stats?.units || 0} 
              change="+" 
              color="blue" 
            />
            <StatCard 
              icon={Users} 
              title={t('residents')} 
              value={stats?.residents || 0} 
              change="+" 
              color="green" 
            />
            <StatCard 
              icon={DollarSign} 
              title={t('income')} 
              value={stats?.income?.formatted?.usd || '$0'} 
              subtitle={stats?.income?.formatted?.ves ? `Bs. ${stats.income.formatted.ves}` : undefined}
              change="+" 
              color="purple" 
            />
            <StatCard 
              icon={Wrench} 
              title={t('pending')} 
              value={stats?.pending?.formatted?.usd || '$0'} 
              subtitle={stats?.pending?.formatted?.ves ? `Bs. ${stats.pending.formatted.ves}` : undefined}
              change="-" 
              color="orange" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('recent_activity')}</h3>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No hay actividad reciente</p>
                ) : (
                  activities.map((activity: any) => {
                    const iconMap: Record<string, any> = {
                      FileText: FileText,
                      DollarSign: DollarSign,
                      Wrench: Wrench,
                      Users: Users,
                    };
                    const Icon = iconMap[activity.icon] || FileText;
                    const timeAgo = getTimeAgo(activity.time);
                    return (
                      <ActivityItem 
                        key={activity.id}
                        icon={Icon} 
                        text={`${activity.title}${activity.description ? ` - ${activity.description}` : ''}`}
                        time={timeAgo}
                      />
                    );
                  })
                )}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('quick_actions')}</h3>
              <div className="space-y-3">
                <QuickAction icon={FileText} label={t('generate_fees')} color="blue" href={`/${locale}/dashboard/admin/billing/new`} />
                <QuickAction icon={DollarSign} label={t('register_payment')} color="green" href={`/${locale}/dashboard/admin/billing`} />
                <QuickAction icon={Wrench} label={t('create_ticket')} color="orange" href={`/${locale}/dashboard/admin/maintenance/new`} />
                <QuickAction icon={Calendar} label={t('reserve_area')} color="purple" href={`/${locale}/dashboard/admin/reservations/new`} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ t, commonT, user, handleLogout, locale }: { t: any; commonT: any; user: any; handleLogout: () => void; locale: string }) {
  return (
    <nav className="space-y-1">
      <SidebarItem icon={LayoutDashboard} label={t('title')} href={`/${locale}/dashboard/admin`} active />
      <SidebarItem icon={Building2} label={commonT('units')} href={`/${locale}/dashboard/admin/units`} />
      <SidebarItem icon={Users} label={t('residents')} href={`/${locale}/dashboard/admin/residents`} />
      <SidebarItem icon={DollarSign} label={t('income')} href={`/${locale}/dashboard/admin/billing`} />
      <SidebarItem icon={Server} label={commonT('services')} href={`/${locale}/dashboard/admin/services`} />
      <SidebarItem icon={CreditCard} label={commonT('expenses')} href={`/${locale}/dashboard/admin/expenses`} />
      <SidebarItem icon={Wrench} label={t('maintenance')} href={`/${locale}/dashboard/admin/maintenance`} />
      <SidebarItem icon={Calendar} label={commonT('reservations')} href={`/${locale}/dashboard/admin/reservations`} />
      <SidebarItem icon={FileText} label={commonT('documents')} href={`/${locale}/dashboard/admin/documents`} />
      <SidebarItem icon={Settings} label={commonT('settings')} href={`/${locale}/dashboard/admin/settings`} />
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

function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  change, 
  color 
}: { 
  icon: any; 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  change: string; 
  color: string 
}) {
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
        <span className={`text-sm font-medium ${change === '+' ? 'text-green-600' : change === '-' ? 'text-gray-400' : 'text-gray-400'}`}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      <p className="text-sm text-gray-500 mt-1">{title}</p>
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

function QuickAction({ icon: Icon, label, color, href }: { icon: any; label: string; color: string; href: string }) {
  const colors = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700',
    green: 'bg-green-50 hover:bg-green-100 text-green-700',
    orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700',
  };
  return (
    <Link
      href={href}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${colors[color as keyof typeof colors]}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}