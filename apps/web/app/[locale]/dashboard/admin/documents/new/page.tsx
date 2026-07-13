'use client';

import { useTranslations } from 'next-intl';
import DocumentForm from '@/components/modules/documents/DocumentForm';

export default function NewDocumentPage() {
  const t = useTranslations('documents');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('new')}</h1>
        <p className="text-gray-500">{t('form_description')}</p>
      </div>
      <DocumentForm />
    </div>
  );
}