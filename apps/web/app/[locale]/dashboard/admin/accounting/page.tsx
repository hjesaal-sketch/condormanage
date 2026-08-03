'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Receipt,
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CreditCard,
  Settings
} from 'lucide-react';
import AccountingStats from '@/components/modules/accounting/AccountingStats';
import BalanceSheet from '@/components/modules/accounting/BalanceSheet';
import IncomeStatement from '@/components/modules/accounting/IncomeStatement';

export default function AccountingDashboardPage() {
  const router = useRouter();
  const t = useTranslations('accounting');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [incomeStatement, setIncomeStatement] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      // Obtener estadísticas
      const statsRes = await fetch('/api/accounting/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Obtener balance general
      const balanceRes = await fetch('/api/accounting/balance-sheet', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const balanceData = await balanceRes.json();
      if (balanceData.success) {
        setBalanceSheet(balanceData.data);
      }

      // Obtener estado de resultados
      const incomeRes = await fetch('/api/accounting/income-statement', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const incomeData = await incomeRes.json();
      if (incomeData.success) {
        setIncomeStatement(incomeData.data);
      }
    } catch (error) {
      console.error('Error fetching accounting data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
          <p className="text-gray-500">{t('description')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/dashboard/admin/accounting/chart-of-accounts')}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            {t('chart_of_accounts')}
          </button>
          <button
            onClick={() => router.push('/dashboard/admin/accounting/entries')}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Receipt className="w-4 h-4" />
            {t('entries')}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && <AccountingStats stats={stats} />}

      {/* Balance Sheet & Income Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {balanceSheet && <BalanceSheet data={balanceSheet} />}
        {incomeStatement && <IncomeStatement data={incomeStatement} />}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction
            icon={DollarSign}
            label="Ver Ingresos"
            href="/dashboard/admin/billing"
            color="text-green-600 bg-green-50 hover:bg-green-100"
          />
          <QuickAction
            icon={TrendingDown}
            label="Ver Gastos"
            href="/dashboard/admin/expenses"
            color="text-red-600 bg-red-50 hover:bg-red-100"
          />
          <QuickAction
            icon={CreditCard}
            label="Facturas Pendientes"
            href="/dashboard/admin/billing?status=PENDING"
            color="text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
          />
          <QuickAction
            icon={BarChart3}
            label="Ver Reportes"
            href="/dashboard/admin/accounting/reports"
            color="text-purple-600 bg-purple-50 hover:bg-purple-100"
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, href, color }: { icon: any; label: string; href: string; color: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${color}`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}