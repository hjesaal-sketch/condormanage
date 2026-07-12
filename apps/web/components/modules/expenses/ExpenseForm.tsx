'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface ExpenseFormProps {
  expenseId?: string;
  initialData?: any;
}

export default function ExpenseForm({ expenseId, initialData }: ExpenseFormProps) {
  const router = useRouter();
  const t = useTranslations('expenses');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'MAINTENANCE',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || 'MAINTENANCE',
        description: initialData.description || '',
        amount: initialData.amount || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        status: initialData.status || 'PENDING',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = expenseId ? `/api/expenses/${expenseId}` : '/api/expenses';
      const method = expenseId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (res.ok) {
        router.push('/dashboard/admin/expenses');
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('category')}</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
        >
          <option value="MAINTENANCE">{t('categories.MAINTENANCE')}</option>
          <option value="REPAIR">{t('categories.REPAIR')}</option>
          <option value="EMERGENCY">{t('categories.EMERGENCY')}</option>
          <option value="SECURITY">{t('categories.SECURITY')}</option>
          <option value="CLEANING">{t('categories.CLEANING')}</option>
          <option value="OTHER">{t('categories.OTHER')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('description')}</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('amount')}</label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('date')}</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
        >
          <option value="PENDING">{t('statuses.PENDING')}</option>
          <option value="APPROVED">{t('statuses.APPROVED')}</option>
          <option value="REJECTED">{t('statuses.REJECTED')}</option>
          <option value="PAID">{t('statuses.PAID')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('notes')}</label>
        <input
          type="text"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          placeholder={t('notes_placeholder')}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
        >
          {loading ? t('saving') : t('save')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/expenses')}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}