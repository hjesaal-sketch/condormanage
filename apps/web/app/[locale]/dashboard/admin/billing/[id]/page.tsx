'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, CreditCard } from 'lucide-react';
import InvoiceSummary from '@/components/modules/billing/InvoiceSummary';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('billing');
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/billing/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setInvoice(data.invoice);
    } catch (error) {
      console.error('Error fetching invoice:', error);
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

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">{t('invoice_not_found')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back')}
      </button>

      <InvoiceSummary invoice={invoice} />

      {invoice.status !== 'PAID' && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => router.push(`/dashboard/admin/billing/${params.id}/pay`)}
            className="bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-green-700"
          >
            <CreditCard className="w-5 h-5" />
            {t('register_payment')}
          </button>
        </div>
      )}
    </div>
  );
}