'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, User, Mail, Phone, FileText, Home, Edit, Trash2 } from 'lucide-react';

export default function ResidentDetailPage() {
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

  const handleDelete = async () => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/residents/${params.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        router.push('/dashboard/admin/residents');
      }
    } catch (error) {
      console.error('Error deleting resident:', error);
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
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{resident.name}</h1>
              <p className="text-gray-500">{resident.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/admin/residents/${params.id}/edit`)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {resident.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>{resident.phone}</span>
            </div>
          )}
          {resident.document && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400" />
              <span>{resident.document}</span>
            </div>
          )}
          {resident.unit_user_rel?.[0]?.unit_id && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Home className="w-5 h-5 text-gray-400" />
              <span>
                {t('unit')}: {resident.unit_user_rel[0].unit_id}
              </span>
            </div>
          )}
          {resident.unit_user_rel?.[0]?.relationship && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{t('relationship')}:</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {t(`relationships.${resident.unit_user_rel[0].relationship}`)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}