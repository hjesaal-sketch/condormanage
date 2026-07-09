'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import RegisterPaymentForm from '@/components/modules/billing/RegisterPaymentForm';

export default function PayInvoicePage() {
  const params = useParams();
  const t = useTranslations('billing');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('register_payment')}</h1>
        <p className="text-gray-500">{t('register_payment_description')}</p>
      </div>
      <RegisterPaymentForm invoiceId={params.id as string} />
    </div>
  );
}