'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface UnitFormProps {
  unitId?: string;
  initialData?: any;
}

export default function UnitForm({ unitId, initialData }: UnitFormProps) {
  const router = useRouter();
  const t = useTranslations('units');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    floor: '',
    area: '',
    type: 'APARTMENT',
    status: 'AVAILABLE',
    bedrooms: '',
    bathrooms: '',
    parkingSpaces: '1',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        number: initialData.number || '',
        floor: initialData.floor || '',
        area: initialData.area || '',
        type: initialData.type || 'APARTMENT',
        status: initialData.status || 'AVAILABLE',
        bedrooms: initialData.bedrooms || '',
        bathrooms: initialData.bathrooms || '',
        parkingSpaces: initialData.parking_spaces || '1',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      floor: formData.floor ? parseInt(formData.floor) : null,
      area: formData.area ? parseFloat(formData.area) : null,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      parkingSpaces: parseInt(formData.parkingSpaces) || 1,
    };

    try {
      const token = localStorage.getItem('token');
      const url = unitId ? `/api/units/${unitId}` : '/api/units';
      const method = unitId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard/admin/units');
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving unit:', error);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('number')}</label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('floor')}</label>
          <input
            type="number"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('area')}</label>
          <input
            type="number"
            step="0.01"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('type')}</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="APARTMENT" className="text-gray-900">{t('types.APARTMENT')}</option>
            <option value="PENTHOUSE" className="text-gray-900">{t('types.PENTHOUSE')}</option>
            <option value="COMMERCIAL" className="text-gray-900">{t('types.COMMERCIAL')}</option>
            <option value="PARKING" className="text-gray-900">{t('types.PARKING')}</option>
            <option value="STORAGE" className="text-gray-900">{t('types.STORAGE')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('bedrooms')}</label>
          <input
            type="number"
            value={formData.bedrooms}
            onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('bathrooms')}</label>
          <input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('parking_spaces')}</label>
          <input
            type="number"
            value={formData.parkingSpaces}
            onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('status')}</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="AVAILABLE" className="text-gray-900">{t('statuses.AVAILABLE')}</option>
          <option value="OCCUPIED" className="text-gray-900">{t('statuses.OCCUPIED')}</option>
          <option value="MAINTENANCE" className="text-gray-900">{t('statuses.MAINTENANCE')}</option>
          <option value="RENTED" className="text-gray-900">{t('statuses.RENTED')}</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : t('save')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/units')}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}