'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ResidentForm from '@/components/modules/residents/ResidentForm';

export default function EditResidentPage() {
  const router = useRouter();
  const params = useParams();
  const t = useTranslations('residents');
  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResident();
  }, []);

  const fetchResident = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/residents/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setResident(data.resident);
    } catch (error) {
      console.error('Error fetching resident:', error);
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

  if (!resident) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">{t('no_residents')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('edit')}</h1>
        <p className="text-gray-500">Complete los campos para actualizar el residente</p>
      </div>
      <ResidentForm residentId={params.id as string} initialData={resident} />
    </div>
  );
}