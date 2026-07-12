'use client';

import { useTranslations } from 'next-intl';
import ExpenseForm from '@/components/modules/expenses/ExpenseForm';

export default function NewExpensePage() {
  const t = useTranslations('expenses');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('new')}</h1>
        <p className="text-gray-500">{t('form_description')}</p>
      </div>
      <ExpenseForm />
    </div>
  );
}