'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Eye, Edit, Trash2, Search, Filter } from 'lucide-react';
import InvoiceList from '@/components/modules/billing/InvoiceList';

export default function BillingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const t = useTranslations('billing');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', month: '', year: '' });

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/billing?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setInvoices(data.invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => router.push(`/${locale}/dashboard/admin/billing/new`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {t('generate_fees')}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">{t('status.all')}</option>
          <option value="PENDING">{t('status.pending')}</option>
          <option value="PAID">{t('status.paid')}</option>
          <option value="OVERDUE">{t('status.overdue')}</option>
        </select>
        <input
          type="number"
          placeholder={t('month')}
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          className="border rounded-lg px-3 py-2 w-24"
          min="1"
          max="12"
        />
        <input
          type="number"
          placeholder={t('year')}
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="border rounded-lg px-3 py-2 w-24"
          min="2020"
          max="2030"
        />
        <button
          onClick={() => setFilters({ status: '', month: '', year: '' })}
          className="text-gray-500 hover:text-gray-700"
        >
          {t('clear_filters')}
        </button>
      </div>

      <InvoiceList invoices={invoices} loading={loading} />
    </div>
  );
}