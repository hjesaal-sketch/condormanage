'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import SettingsForm from '@/components/modules/settings/SettingsForm';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-gray-500">{t('description')}</p>
      </div>
      <SettingsForm settings={settings} onSave={fetchSettings} />
    </div>
  );
}