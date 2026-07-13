'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';

export default function ReservationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const t = useTranslations('reservations');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', areaId: '' });

  useEffect(() => {
    fetchReservations();
  }, [filters]);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/reservations?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setReservations(data.reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
    }
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => router.push(`/${locale}/dashboard/admin/reservations/new`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {t('new')}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">{t('status')}</option>
          <option value="PENDING">{t('statuses.PENDING')}</option>
          <option value="APPROVED">{t('statuses.APPROVED')}</option>
          <option value="REJECTED">{t('statuses.REJECTED')}</option>
          <option value="CANCELLED">{t('statuses.CANCELLED')}</option>
          <option value="COMPLETED">{t('statuses.COMPLETED')}</option>
        </select>
        <button
          onClick={() => setFilters({ status: '', areaId: '' })}
          className="text-gray-500 hover:text-gray-700"
        >
          {t('clear_filters')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('area')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('unit')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('date')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('start_time')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('end_time')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('status')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">{t('loading')}</td></tr>
            ) : reservations.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">{t('no_reservations')}</td></tr>
            ) : (
              reservations.map((reservation: any) => (
                <tr key={reservation.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{reservation.area?.name || '-'}</td>
                  <td className="px-4 py-3">{reservation.unit?.number || '-'}</td>
                  <td className="px-4 py-3">{new Date(reservation.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{reservation.start_time}</td>
                  <td className="px-4 py-3">{reservation.end_time}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[reservation.status as keyof typeof statusColors]}`}>
                      {t(`statuses.${reservation.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/${locale}/dashboard/admin/reservations/${reservation.id}`)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => router.push(`/${locale}/dashboard/admin/reservations/${reservation.id}/edit`)}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(reservation.id)}
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