'use client';

import { useTranslations } from 'next-intl';

interface Entry {
  id: string;
  entry_date: string;
  description: string;
  reference_type: string;
  status: string;
  lines: {
    account_name: string;
    debit: number;
    credit: number;
  }[];
}

interface EntriesTableProps {
  entries: Entry[];
}

export default function EntriesTable({ entries }: EntriesTableProps) {
  const t = useTranslations('accounting');

  if (!entries || entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
        {t('no_data')}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'text-yellow-600 bg-yellow-50',
      POSTED: 'text-green-600 bg-green-50',
      VOID: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('columns.date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('columns.description')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('columns.reference')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('columns.status')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('columns.debit')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('columns.credit')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(entry.entry_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">{entry.description}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{entry.reference_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                    {entry.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right text-green-600">
                  ${entry.lines?.reduce((sum, line) => sum + line.debit, 0)?.toFixed(2) || '0.00'}
                </td>
                <td className="px-6 py-4 text-sm text-right text-red-600">
                  ${entry.lines?.reduce((sum, line) => sum + line.credit, 0)?.toFixed(2) || '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}