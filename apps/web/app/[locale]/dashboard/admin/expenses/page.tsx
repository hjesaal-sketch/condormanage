'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function ExpensesPage() {
  const router = useRouter();
  const t = useTranslations('expenses');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/expenses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setExpenses(data.expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PAID: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => router.push('/dashboard/admin/expenses/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {t('new')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('category')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('description')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('amount')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('date')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('status')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Cargando...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">{t('no_expenses')}</td></tr>
            ) : (
              expenses.map((expense: any) => (
                <tr key={expense.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{t(`categories.${expense.category}`)}</td>
                  <td className="px-4 py-3">{expense.description}</td>
                  <td className="px-4 py-3">${expense.amount.toFixed(2)}</td>
                  <td className="px-4 py-3">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[expense.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                      {t(`statuses.${expense.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/dashboard/admin/expenses/${expense.id}/edit`)}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}