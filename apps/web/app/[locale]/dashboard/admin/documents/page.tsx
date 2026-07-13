'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Edit, Trash2, Eye, Search, Filter, File, Download } from 'lucide-react';

export default function DocumentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const t = useTranslations('documents');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [search, category]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams({ search, category }).toString();
      const res = await fetch(`/api/documents?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('image')) return '🖼️';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
    if (mimeType?.includes('excel') || mimeType?.includes('sheet')) return '📊';
    return '📁';
  };

  const categoryColors = {
    GENERAL: 'bg-gray-100 text-gray-800',
    CONTRACT: 'bg-blue-100 text-blue-800',
    INVOICE: 'bg-green-100 text-green-800',
    REPORT: 'bg-purple-100 text-purple-800',
    MINUTES: 'bg-yellow-100 text-yellow-800',
    RULES: 'bg-red-100 text-red-800',
    MAINTENANCE: 'bg-orange-100 text-orange-800',
    OTHER: 'bg-gray-100 text-gray-800',
    RECEIPT: 'bg-emerald-100 text-emerald-800',
    CERTIFICATE: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => router.push(`/${locale}/dashboard/admin/documents/new`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {t('new')}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">{t('all_categories')}</option>
          <option value="GENERAL">{t('categories.GENERAL')}</option>
          <option value="CONTRACT">{t('categories.CONTRACT')}</option>
          <option value="INVOICE">{t('categories.INVOICE')}</option>
          <option value="REPORT">{t('categories.REPORT')}</option>
          <option value="MINUTES">{t('categories.MINUTES')}</option>
          <option value="RULES">{t('categories.RULES')}</option>
          <option value="MAINTENANCE">{t('categories.MAINTENANCE')}</option>
          <option value="RECEIPT">{t('categories.RECEIPT')}</option>
          <option value="CERTIFICATE">{t('categories.CERTIFICATE')}</option>
        </select>
        <button
          onClick={() => { setSearch(''); setCategory(''); }}
          className="text-gray-500 hover:text-gray-700"
        >
          {t('clear_filters')}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('title')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('category')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('file')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('public')}</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">{t('created_at')}</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">{t('loading')}</td></tr>
            ) : documents.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">{t('no_documents')}</td></tr>
            ) : (
              documents.map((doc: any) => (
                <tr key={doc.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getFileIcon(doc.mimeType)}</span>
                      {doc.title}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${categoryColors[doc.category as keyof typeof categoryColors]}`}>
                      {t(`categories.${doc.category}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="w-4 h-4 inline" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {doc.isPublic ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-red-600">🔒</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => router.push(`/${locale}/dashboard/admin/documents/${doc.id}`)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <Eye className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => router.push(`/${locale}/dashboard/admin/documents/${doc.id}/edit`)}
                      className="text-gray-600 hover:text-gray-800 mr-2"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
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