'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function GenerateFeesForm() {
  const router = useRouter();
  const t = useTranslations('billing');
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: 150000,
    concept: '',
    applyToAll: true,
    unitId: '',
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/units?status=OCCUPIED', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUnits(data.units);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/billing/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        router.push('/dashboard/admin/billing');
        router.refresh();
      } else {
        alert(data.error || 'Error al generar cuotas');
      }
    } catch (error) {
      console.error('Error generating fees:', error);
      alert('Error al generar cuotas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('month')}</label>
          <select
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m} className="text-gray-900">
                {new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('year')}</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="2020"
            max="2030"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('amount')}</label>
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('concept')}</label>
        <input
          type="text"
          value={formData.concept}
          onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t('concept_placeholder')}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-gray-700">
          <input
            type="checkbox"
            checked={formData.applyToAll}
            onChange={(e) => setFormData({ ...formData, applyToAll: e.target.checked })}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-sm">{t('apply_to_all_units')}</span>
        </label>
      </div>

      {!formData.applyToAll && (
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('unit')}</label>
          <select
            value={formData.unitId}
            onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" className="text-gray-900">{t('select_unit')}</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id} className="text-gray-900">
                {unit.number}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('generating') : t('generate_fees')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/billing')}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}