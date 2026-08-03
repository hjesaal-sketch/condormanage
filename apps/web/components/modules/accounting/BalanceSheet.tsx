'use client';

import { useTranslations } from 'next-intl';

interface BalanceSheetProps {
  data: {
    assets: { code: string; name: string; balance: number }[];
    liabilities: { code: string; name: string; balance: number }[];
    equity: { code: string; name: string; balance: number }[];
  };
}

export default function BalanceSheet({ data }: BalanceSheetProps) {
  const t = useTranslations('accounting');

  const totalAssets = data?.assets?.reduce((sum, item) => sum + item.balance, 0) || 0;
  const totalLiabilities = data?.liabilities?.reduce((sum, item) => sum + item.balance, 0) || 0;
  const totalEquity = data?.equity?.reduce((sum, item) => sum + item.balance, 0) || 0;

  if (!data || (!data.assets?.length && !data.liabilities?.length && !data.equity?.length)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
        {t('no_data')}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">{t('balance_sheet')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {/* Activos */}
        <div className="p-6">
          <h4 className="font-medium text-gray-700 mb-3">Activos</h4>
          <div className="space-y-2">
            {data?.assets?.map((item) => (
              <div key={item.code} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">{item.code} - {item.name}</span>
                <span className="font-medium text-gray-800">${item.balance.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-800">Total Activos</span>
              <span className="text-gray-800">${totalAssets.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Pasivos + Patrimonio */}
        <div className="p-6">
          <h4 className="font-medium text-gray-700 mb-3">Pasivos</h4>
          <div className="space-y-2 mb-4">
            {data?.liabilities?.map((item) => (
              <div key={item.code} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">{item.code} - {item.name}</span>
                <span className="font-medium text-gray-800">${item.balance.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-800">Total Pasivos</span>
              <span className="text-gray-800">${totalLiabilities.toFixed(2)}</span>
            </div>
          </div>

          <h4 className="font-medium text-gray-700 mb-3">Patrimonio</h4>
          <div className="space-y-2">
            {data?.equity?.map((item) => (
              <div key={item.code} className="flex justify-between text-sm py-1">
                <span className="text-gray-600">{item.code} - {item.name}</span>
                <span className="font-medium text-gray-800">${item.balance.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-800">Total Patrimonio</span>
              <span className="text-gray-800">${totalEquity.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-800">Total Pasivos + Patrimonio</span>
              <span className="text-gray-800">${(totalLiabilities + totalEquity).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}