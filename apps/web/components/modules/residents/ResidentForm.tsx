'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface ResidentFormProps {
  residentId?: string;
  initialData?: any;
}

export default function ResidentForm({ residentId, initialData }: ResidentFormProps) {
  const router = useRouter();
  const t = useTranslations('residents');
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    unitId: '',
    relationship: 'RESIDENT',
  });

  useEffect(() => {
    fetchUnits();
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        document: initialData.document || '',
        unitId: initialData.unit_user_rel?.[0]?.unit_id || '',
        relationship: initialData.unit_user_rel?.[0]?.relationship || 'RESIDENT',
      });
    }
  }, [initialData]);

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/units', {
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

    const payload = {
      ...formData,
      unitId: formData.unitId || undefined,
    };

    try {
      const token = localStorage.getItem('token');
      const url = residentId ? `/api/residents/${residentId}` : '/api/residents';
      const method = residentId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard/admin/residents');
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving resident:', error);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('phone')}</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('document')}</label>
          <input
            type="text"
            value={formData.document}
            onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('unit')}</label>
          <select
            value={formData.unitId}
            onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" className="text-gray-900">{t('unassigned')}</option>
            {units.map((unit: any) => (
              <option key={unit.id} value={unit.id} className="text-gray-900">
                {unit.number} - {unit.floor ? `Piso ${unit.floor}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('relationship')}</label>
          <select
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="OWNER" className="text-gray-900">{t('relationships.OWNER')}</option>
            <option value="TENANT" className="text-gray-900">{t('relationships.TENANT')}</option>
            <option value="RESIDENT" className="text-gray-900">{t('relationships.RESIDENT')}</option>
            <option value="CO_OWNER" className="text-gray-900">{t('relationships.CO_OWNER')}</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t('saving') : t('save')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/residents')}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}