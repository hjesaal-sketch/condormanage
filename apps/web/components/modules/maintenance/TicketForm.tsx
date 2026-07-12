'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface TicketFormProps {
  ticketId?: string;
  initialData?: any;
}

export default function TicketForm({ ticketId, initialData }: TicketFormProps) {
  const router = useRouter();
  const t = useTranslations('maintenance');
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    unitId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedTo: '',
  });

  useEffect(() => {
    fetchUnits();
    fetchStaff();
    if (initialData) {
      setFormData({
        unitId: initialData.unit_id || '',
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'MEDIUM',
        assignedTo: initialData.assigned_to || '',
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

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users?role=STAFF', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStaff(data.users);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = ticketId ? `/api/tickets/${ticketId}` : '/api/tickets';
      const method = ticketId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/dashboard/admin/maintenance');
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-sm">
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
        <label className="block text-sm font-medium text-gray-700">{t('title_field')}</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('description')}</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('priority')}</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          >
            <option value="LOW">{t('priorities.LOW')}</option>
            <option value="MEDIUM">{t('priorities.MEDIUM')}</option>
            <option value="HIGH">{t('priorities.HIGH')}</option>
            <option value="URGENT">{t('priorities.URGENT')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('assigned_to')}</label>
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          >
            <option value="">{t('unassigned')}</option>
            {staff.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
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
          onClick={() => router.push('/dashboard/admin/maintenance')}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}