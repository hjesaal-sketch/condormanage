'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Eye, CreditCard } from 'lucide-react';

interface InvoiceListProps {
  invoices: any[];
  loading: boolean;
}

export default function InvoiceList({ invoices, loading }: InvoiceListProps) {
  const router = useRouter();
  const t = useTranslations('billing');

  if (loading) {
    return <div className="text-center py-8 text-gray-600">{t('loading')}</div>;
  }

  if (invoices.length === 0) {
    return <div className="text-center py-8 text-gray-500">{t('no_invoices')}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('number')}</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('unit')}</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('issue_date')}</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('due_date')}</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('amount')}</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('status')}</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice: any) => (
            <tr key={invoice.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-800">{invoice.number}</td>
              <td className="px-4 py-3 text-gray-800">{invoice.unit?.number || '-'}</td>
              <td className="px-4 py-3 text-gray-800">{new Date(invoice.issue_date).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-gray-800">{new Date(invoice.due_date).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-gray-800 font-medium">${invoice.amount.toFixed(2)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                  invoice.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {t(`status.${invoice.status.toLowerCase()}`)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => router.push(`/dashboard/admin/billing/${invoice.id}`)}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                >
                  <Eye className="w-4 h-4 inline" />
                </button>
                {invoice.status !== 'PAID' && (
                  <button
                    onClick={() => router.push(`/dashboard/admin/billing/${invoice.id}/pay`)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <CreditCard className="w-4 h-4 inline" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}