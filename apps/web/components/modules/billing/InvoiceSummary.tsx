'use client';

import { useTranslations } from 'next-intl';
import { Calendar, DollarSign, Home, FileText } from 'lucide-react';

interface InvoiceSummaryProps {
  invoice: any;
}

export default function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
  const t = useTranslations('billing');

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('invoice')}: {invoice.number}</h2>
          <p className="text-sm text-gray-500">{invoice.concept}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${statusColors[invoice.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
          {t(`status.${invoice.status.toLowerCase()}`)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Home className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">{t('unit')}</p>
            <p className="font-medium">{invoice.unit?.number || '-'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">{t('amount')}</p>
            <p className="font-medium text-lg">${invoice.amount.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">{t('issue_date')}</p>
            <p className="font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">{t('due_date')}</p>
            <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {invoice.metadata?.items && invoice.metadata.items.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">{t('items')}</h4>
          <div className="space-y-2">
            {invoice.metadata.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                <span>{item.description}</span>
                <span>${item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoice.payments && invoice.payments.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-2">{t('payments')}</h4>
          {invoice.payments.map((payment: any) => (
            <div key={payment.id} className="flex justify-between p-2 bg-green-50 rounded">
              <span>{t('payment')} #{payment.id.slice(0, 8)}</span>
              <span className="font-medium">${payment.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}