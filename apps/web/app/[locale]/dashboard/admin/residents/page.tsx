'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Eye, Search, User } from 'lucide-react';

export default function ResidentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const t = useTranslations('residents');
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResidents();
  }, [search]);

  const fetchResidents = async () => {
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams({ search }).toString();
      const res = await fetch(`/api/residents?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setResidents(data.residents);
    } catch (error) {
      console.error('Error fetching residents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/residents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchResidents();
    } catch (error) {
      console.error('Error deleting resident:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => router.push(`/${locale}/dashboard/admin/residents/new`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {t('new')}
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`${t('name')} o ${t('email')}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('name')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('email')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('phone')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('unit')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('relationship')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Cargando...</td></tr>
            ) : residents.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">{t('no_residents')}</td></tr>
            ) : (
              residents.map((resident: any) => (
                <tr key={resident.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User className="w-4 h-4" />
                      </div>
                      {resident.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">{resident.email}</td>
                  <td className="px-4 py-3">{resident.phone || '-'}</td>
                  <td className="px-4 py-3">
                    {resident.unit_user_rel?.[0]?.unit_id || 'Sin asignar'}
                  </td>
                  <td className="px-4 py-3">
                    {resident.unit_user_rel?.[0]?.relationship 
                      ? t(`relationships.${resident.unit_user_rel[0].relationship}`)
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/${locale}/dashboard/admin/residents/${resident.id}`)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => router.push(`/${locale}/dashboard/admin/residents/${resident.id}/edit`)}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(resident.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}