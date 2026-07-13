'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface DocumentFormProps {
  documentId?: string;
  initialData?: any;
}

export default function DocumentForm({ documentId, initialData }: DocumentFormProps) {
  const router = useRouter();
  const t = useTranslations('documents');
  const [loading, setLoading] = useState(false);
  const [residents, setResidents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileSize: '',
    mimeType: '',
    category: 'GENERAL',
    tags: '',
    isPublic: true,
    residentId: '',
    isGenerated: false,
    relatedEntityId: '',
    relatedEntityType: '',
  });

  useEffect(() => {
    fetchResidents();
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        fileUrl: initialData.fileUrl || '',
        fileSize: initialData.fileSize || '',
        mimeType: initialData.mimeType || '',
        category: initialData.category || 'GENERAL',
        tags: initialData.tags?.join(', ') || '',
        isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true,
        residentId: initialData.residentId || '',
        isGenerated: initialData.isGenerated || false,
        relatedEntityId: initialData.relatedEntityId || '',
        relatedEntityType: initialData.relatedEntityType || '',
      });
    }
  }, [initialData]);

  const fetchResidents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/residents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setResidents(data.residents);
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      fileSize: formData.fileSize ? parseInt(formData.fileSize) : null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
    };

    try {
      const token = localStorage.getItem('token');
      const url = documentId ? `/api/documents/${documentId}` : '/api/documents';
      const method = documentId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard/admin/documents');
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('title')}</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('description')}</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('file_url')}</label>
        <input
          type="url"
          value={formData.fileUrl}
          onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          placeholder="https://ejemplo.com/documento.pdf"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('file_size')}</label>
          <input
            type="number"
            value={formData.fileSize}
            onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            placeholder="Bytes"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('mime_type')}</label>
          <input
            type="text"
            value={formData.mimeType}
            onChange={(e) => setFormData({ ...formData, mimeType: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            placeholder="application/pdf"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('category')}</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          >
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
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('tags')}</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            placeholder="tag1, tag2, tag3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('public')}</label>
          <select
            value={formData.isPublic ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === 'true' })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          >
            <option value="true">{t('public_yes')}</option>
            <option value="false">{t('public_no')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('resident')}</label>
          <select
            value={formData.residentId}
            onChange={(e) => setFormData({ ...formData, residentId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
          >
            <option value="">{t('no_resident')}</option>
            {residents.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.name} - {r.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
        >
          {loading ? t('saving') : t('save')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/documents')}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-300"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}