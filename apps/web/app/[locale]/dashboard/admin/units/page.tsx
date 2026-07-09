'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';

export default function UnitsPage() {
  const router = useRouter();
  const t = useTranslations('units');
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', status: '', floor: '' });

  useEffect(() => {
    fetchUnits();
  }, [filters]);

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/units?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUnits(data.units);
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/units/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchUnits();
    } catch (error) {
      console.error('Error deleting unit:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => router.push('/dashboard/admin/units/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {t('new_unit')}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">{t('type')}</option>
          <option value="APARTMENT">{t('types.APARTMENT')}</option>
          <option value="PENTHOUSE">{t('types.PENTHOUSE')}</option>
          <option value="COMMERCIAL">{t('types.COMMERCIAL')}</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">{t('status')}</option>
          <option value="AVAILABLE">{t('statuses.AVAILABLE')}</option>
          <option value="OCCUPIED">{t('statuses.OCCUPIED')}</option>
          <option value="MAINTENANCE">{t('statuses.MAINTENANCE')}</option>
        </select>
        <input
          type="number"
          placeholder={t('floor')}
          value={filters.floor}
          onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
          className="border rounded-lg px-3 py-2 w-24"
        />
        <button
          onClick={() => setFilters({ type: '', status: '', floor: '' })}
          className="text-gray-500 hover:text-gray-700"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('number')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('floor')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('type')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('status')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('area')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Cargando...</td></tr>
            ) : units.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No hay unidades</td></tr>
            ) : (
              units.map((unit: any) => (
                <tr key={unit.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{unit.number}</td>
                  <td className="px-4 py-3">{unit.floor || '-'}</td>
                  <td className="px-4 py-3">{t(`types.${unit.type}`)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      unit.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                      unit.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {t(`statuses.${unit.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{unit.area || '-'} m²</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/dashboard/admin/units/${unit.id}`)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/admin/units/${unit.id}/edit`)}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(unit.id)}
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