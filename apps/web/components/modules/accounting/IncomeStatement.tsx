'use client';

import { useTranslations } from 'next-intl';

interface IncomeStatementProps {
  data: {
    income: { code: string; name: string; balance: number }[];
    expenses: { code: string; name: string; balance: number }[];
  };
}

export default function IncomeStatement({ data }: IncomeStatementProps) {
  const t = useTranslations('accounting');

  const totalIncome = data?.income?.reduce((sum, item) => sum + item.balance, 0) || 0;
  const totalExpenses = data?.expenses?.reduce((sum, item) => sum + item.balance, 0) || 0;
  const netIncome = totalIncome - totalExpenses;

  if (!data || (!data.income?.length && !data.expenses?.length)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
        {t('no_data')}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">{t('income_statement')}</h3>
      </div>

      <div className="p-6">
        {/* Ingresos */}
        <h4 className="font-medium text-gray-700 mb-3">Ingresos</h4>
        <div className="space-y-2 mb-4">
          {data?.income?.map((item) => (
            <div key={item.code} className="flex justify-between text-sm py-1">
              <span className="text-gray-600">{item.code} - {item.name}</span>
              <span className="font-medium text-green-600">${item.balance.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-800">Total Ingresos</span>
            <span className="text-green-600">${totalIncome.toFixed(2)}</span>
          </div>
        </div>

        {/* Gastos */}
        <h4 className="font-medium text-gray-700 mb-3">Gastos</h4>
        <div className="space-y-2 mb-4">
          {data?.expenses?.map((item) => (
            <div key={item.code} className="flex justify-between text-sm py-1">
              <span className="text-gray-600">{item.code} - {item.name}</span>
              <span className="font-medium text-red-600">${item.balance.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-800">Total Gastos</span>
            <span className="text-red-600">${totalExpenses.toFixed(2)}</span>
          </div>
        </div>

        {/* Resultado Neto */}
        <div className="mt-4 pt-4 border-t-2 border-gray-200">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-gray-800">Resultado Neto</span>
            <span className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
              ${netIncome.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}