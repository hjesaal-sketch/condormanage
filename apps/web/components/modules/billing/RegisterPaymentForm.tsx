'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface RegisterPaymentFormProps {
  invoiceId: string;
}

export default function RegisterPaymentForm({ invoiceId }: RegisterPaymentFormProps) {
  const router = useRouter();
  const t = useTranslations('billing');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'CASH',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/billing/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invoiceId,
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(t('payment_registered'));
        router.push(`/dashboard/admin/billing/${invoiceId}`);
        router.refresh();
      } else {
        alert(data.error || 'Error al registrar pago');
      }
    } catch (error) {
      console.error('Error registering payment:', error);
      alert('Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('amount')}</label>
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('payment_method')}</label>
        <select
          value={formData.method}
          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="CASH">{t('method.cash')}</option>
          <option value="BANK_TRANSFER">{t('method.bank_transfer')}</option>
          <option value="MOBILE_PAYMENT">{t('method.mobile_payment')}</option>
          <option value="CREDIT_CARD">{t('method.credit_card')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('reference')}</label>
        <input
          type="text"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          placeholder={t('reference_placeholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('payment_date')}</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? t('registering') : t('register_payment')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}