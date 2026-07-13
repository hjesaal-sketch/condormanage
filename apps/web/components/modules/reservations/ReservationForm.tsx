'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface ReservationFormProps {
  reservationId?: string;
  initialData?: any;
}

export default function ReservationForm({ reservationId, initialData }: ReservationFormProps) {
  const router = useRouter();
  const t = useTranslations('reservations');
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    areaId: '',
    unitId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
  });

  useEffect(() => {
    fetchAreas();
    fetchUnits();
    if (initialData) {
      setFormData({
        areaId: initialData.area_id || '',
        unitId: initialData.unit_id || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        startTime: initialData.start_time || '09:00',
        endTime: initialData.end_time || '10:00',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const fetchAreas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/common-areas', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAreas(data.areas);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

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

    try {
      const token = localStorage.getItem('token');
      const url = reservationId ? `/api/reservations/${reservationId}` : '/api/reservations';
      const method = reservationId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/dashboard/admin/reservations');
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('area')}</label>
        <select
          value={formData.areaId}
          onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          required
        >
          <option value="">{t('select_area')}</option>
          {areas.map((area: any) => (
            <option key={area.id} value={area.id}>
              {area.name} {area.capacity ? `(Cap: ${area.capacity})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('unit')}</label>
        <select
          value={formData.unitId}
          onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          required
        >
          <option value="">{t('select_unit')}</option>
          {units.map((unit: any) => (
            <option key={unit.id} value={unit.id}>
              {unit.number} - {unit.floor ? `Piso ${unit.floor}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('date')}</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('start_time')}</label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('end_time')}</label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('notes')}</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          rows={2}
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
          onClick={() => router.push('/dashboard/admin/reservations')}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}