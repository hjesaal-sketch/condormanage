'use client';

import { useTranslations } from 'next-intl';
import GenerateFeesForm from '@/components/modules/billing/GenerateFeesForm';

export default function NewBillingPage() {
  const t = useTranslations('billing');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('generate_fees')}</h1>
        <p className="text-gray-500">{t('generate_fees_description')}</p>
      </div>
      <GenerateFeesForm />
    </div>
  );
}