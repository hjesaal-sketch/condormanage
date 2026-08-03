'use client';

import { useTranslations } from 'next-intl';
import { DollarSign, CreditCard, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface AccountingStatsProps {
  stats: {
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
    total_income: number;
    total_expenses: number;
    net_income: number;
    pending_invoices: number;
    overdue_invoices: number;
    total_paid: number;
    morosity_rate: number;
  };
}

export default function AccountingStats({ stats }: AccountingStatsProps) {
  const t = useTranslations('accounting');

  const cards = [
    {
      title: t('total_assets'),
      value: `$${stats?.total_assets?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: t('total_liabilities'),
      value: `$${stats?.total_liabilities?.toLocaleString() || '0'}`,
      icon: TrendingDown,
      color: 'text-red-600 bg-red-50',
    },
    {
      title: t('total_equity'),
      value: `$${stats?.total_equity?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: t('net_income'),
      value: `$${stats?.net_income?.toLocaleString() || '0'}`,
      icon: stats?.net_income >= 0 ? TrendingUp : TrendingDown,
      color: stats?.net_income >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
    },
    {
      title: t('pending_invoices'),
      value: stats?.pending_invoices?.toString() || '0',
      icon: CreditCard,
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      title: t('overdue_invoices'),
      value: stats?.overdue_invoices?.toString() || '0',
      icon: AlertCircle,
      color: 'text-red-600 bg-red-50',
    },
    {
      title: t('total_paid'),
      value: `$${stats?.total_paid?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: t('morosity_rate'),
      value: `${stats?.morosity_rate?.toFixed(1) || '0'}%`,
      icon: AlertCircle,
      color: stats?.morosity_rate > 10 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          <p className="text-sm text-gray-500">{card.title}</p>
        </div>
      ))}
    </div>
  );
}