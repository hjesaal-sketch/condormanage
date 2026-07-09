'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import UnitForm from '@/components/modules/units/UnitForm';

export default function EditUnitPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('units');
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnit();
  }, []);

  const fetchUnit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/units/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUnit(data.unit);
    } catch (error) {
      console.error('Error fetching unit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Unidad no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('edit_unit')}</h1>
        <p className="text-gray-500">Complete los campos para actualizar la unidad</p>
      </div>
      <UnitForm unitId={params.id as string} initialData={unit} />
    </div>
  );
}