'use client';

import { useTranslations } from 'next-intl';
import UnitForm from '@/components/modules/units/UnitForm';

export default function NewUnitPage() {
  const t = useTranslations('units');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('new_unit')}</h1>
        <p className="text-gray-500">Complete los campos para registrar una nueva unidad</p>
      </div>
      <UnitForm />
    </div>
  );
}