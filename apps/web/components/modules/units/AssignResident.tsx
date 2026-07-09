'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface AssignResidentProps {
  unitId: string;
  onAssign?: () => void;
  onCancel?: () => void;
}

export default function AssignResident({ unitId, onAssign, onCancel }: AssignResidentProps) {
  const t = useTranslations('residents');
  const [residents, setResidents] = useState<any[]>([]);
  const [selectedResident, setSelectedResident] = useState('');
  const [relationship, setRelationship] = useState('RESIDENT');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableResidents();
  }, []);

  const fetchAvailableResidents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/residents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const available = data.residents.filter((r: any) => 
          !r.unit_user_rel || r.unit_user_rel.length === 0
        );
        setResidents(available);
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedResident) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        unitId,
        userId: selectedResident,
        relationship,
        startDate: new Date().toISOString(),
        isPrimary: true,
      };

      const res = await fetch(`/api/units/${unitId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (onAssign) onAssign();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al asignar');
      }
    } catch (error) {
      console.error('Error assigning resident:', error);
      alert('Error al asignar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('select_resident')}
        </label>
        <select
          value={selectedResident}
          onChange={(e) => setSelectedResident(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">{t('select_resident')}</option>
          {residents.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} - {r.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('relationship')}
        </label>
        <select
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="OWNER">{t('relationships.OWNER')}</option>
          <option value="TENANT">{t('relationships.TENANT')}</option>
          <option value="RESIDENT">{t('relationships.RESIDENT')}</option>
          <option value="CO_OWNER">{t('relationships.CO_OWNER')}</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSubmit}
          disabled={!selectedResident || loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Asignando...' : t('assign_unit')}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
          >
            {t('cancel')}
          </button>
        )}
      </div>
    </div>
  );
}