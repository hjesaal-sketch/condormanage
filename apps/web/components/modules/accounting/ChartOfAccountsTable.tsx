'use client';

import { useTranslations } from 'next-intl';

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  balance: number;
}

interface ChartOfAccountsTableProps {
  accounts: Account[];
}

export default function ChartOfAccountsTable({ accounts }: ChartOfAccountsTableProps) {
  const t = useTranslations('accounting');

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
        {t('no_data')}
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ACTIVO: 'text-green-600 bg-green-50',
      PASIVO: 'text-red-600 bg-red-50',
      PATRIMONIO: 'text-blue-600 bg-blue-50',
      INGRESO: 'text-purple-600 bg-purple-50',
      GASTO: 'text-orange-600 bg-orange-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('columns.code')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('columns.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('columns.type')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('columns.category')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('columns.balance')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-600">{account.code}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{account.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(account.type)}`}>
                    {account.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{account.category || '-'}</td>
                <td className="px-6 py-4 text-sm text-right font-medium text-gray-800">
                  ${account.balance?.toFixed(2) || '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}