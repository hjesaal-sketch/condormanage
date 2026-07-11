'use client';

import { useTranslations } from 'next-intl';
import ServiceForm from '@/components/modules/services/ServiceForm';

export default function NewServicePage() {
  const t = useTranslations('services');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('new')}</h1>
        <p className="text-gray-500">Complete los campos para registrar un nuevo servicio</p>
      </div>
      <ServiceForm />
    </div>
  );
}