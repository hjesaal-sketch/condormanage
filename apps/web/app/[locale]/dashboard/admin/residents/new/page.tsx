'use client';

import { useTranslations } from 'next-intl';
import ResidentForm from '@/components/modules/residents/ResidentForm';

export default function NewResidentPage() {
  const t = useTranslations('residents');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('new')}</h1>
        <p className="text-gray-500">{t('form_description')}</p>
      </div>
      <ResidentForm />
    </div>
  );
}