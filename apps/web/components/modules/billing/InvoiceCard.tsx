'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Eye, CreditCard, Calendar, DollarSign } from 'lucide-react';

interface InvoiceCardProps {
  invoice: any;
}

export default function InvoiceCard({ invoice }: InvoiceCardProps) {
  const router = useRouter();
  const t = useTranslations('billing');

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-800">{invoice.number}</h3>
          <p className="text-sm text-gray-500">{t('unit')}: {invoice.unit?.number || '-'}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
          {t(`status.${invoice.status.toLowerCase()}`)}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{t('issue_date')}: {new Date(invoice.issue_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{t('due_date')}: {new Date(invoice.due_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="font-medium">${invoice.amount.toFixed(2)}</span>
        </div>
        {invoice.concept && (
          <div className="text-gray-500 text-xs">{invoice.concept}</div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => router.push(`/dashboard/admin/billing/${invoice.id}`)}
          className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Eye className="w-4 h-4 inline mr-1" />
          {t('view')}
        </button>
        {invoice.status !== 'PAID' && (
          <button
            onClick={() => router.push(`/dashboard/admin/billing/${invoice.id}/pay`)}
            className="flex-1 text-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CreditCard className="w-4 h-4 inline mr-1" />
            {t('pay')}
          </button>
        )}
      </div>
    </div>
  );
}