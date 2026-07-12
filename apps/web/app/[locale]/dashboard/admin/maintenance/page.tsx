'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';

export default function MaintenancePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const t = useTranslations('maintenance');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/tickets?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTickets(data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const priorityColors = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => router.push(`/${locale}/dashboard/admin/maintenance/new`)}
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
          <option value="OPEN">{t('statuses.OPEN')}</option>
          <option value="IN_PROGRESS">{t('statuses.IN_PROGRESS')}</option>
          <option value="RESOLVED">{t('statuses.RESOLVED')}</option>
          <option value="CLOSED">{t('statuses.CLOSED')}</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">{t('priority')}</option>
          <option value="LOW">{t('priorities.LOW')}</option>
          <option value="MEDIUM">{t('priorities.MEDIUM')}</option>
          <option value="HIGH">{t('priorities.HIGH')}</option>
          <option value="URGENT">{t('priorities.URGENT')}</option>
        </select>
        <button
          onClick={() => setFilters({ status: '', priority: '' })}
          className="text-gray-500 hover:text-gray-700"
        >
          {t('clear_filters')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('ticket')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('unit')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('title_field')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('priority')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('status')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('created_at')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">{t('loading')}</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">{t('no_tickets')}</td></tr>
            ) : (
              tickets.map((ticket: any) => (
                <tr key={ticket.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">#{ticket.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{ticket.unit?.number || '-'}</td>
                  <td className="px-4 py-3">{ticket.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}>
                      {t(`priorities.${ticket.priority}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status as keyof typeof statusColors]}`}>
                      {t(`statuses.${ticket.status}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/${locale}/dashboard/admin/maintenance/${ticket.id}`)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => router.push(`/${locale}/dashboard/admin/maintenance/${ticket.id}/edit`)}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(ticket.id)}
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