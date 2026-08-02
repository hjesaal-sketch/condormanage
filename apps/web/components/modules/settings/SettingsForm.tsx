'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Save } from 'lucide-react';

interface SettingsFormProps {
  settings: any;
  onSave: () => void;
}

export default function SettingsForm({ settings, onSave }: SettingsFormProps) {
  const t = useTranslations('settings');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    condoName: settings?.condoName || '',
    currency: settings?.currency || 'USD',
    dueDay: settings?.dueDay || 15,
    issueDay: settings?.issueDay || 1,
    lateFee: settings?.lateFee || 5,
    reservationDays: settings?.reservationDays || 7,
    reservationStart: settings?.reservationStart || '08:00',
    reservationEnd: settings?.reservationEnd || '20:00',
    loginAttempts: settings?.loginAttempts || 5,
    sessionTimeout: settings?.sessionTimeout || 60,
    // 🆕 Nuevos campos para tasa de cambio
    exchangeRate: settings?.exchangeRate || 0,
    exchangeRateDate: settings?.exchangeRateDate || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const entries = Object.entries(formData);
      
      for (const [key, value] of entries) {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ key, value }),
        });
      }

      alert(t('saved'));
      onSave();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl bg-white p-6 rounded-xl shadow-sm">
      {/* General */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('general')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.condo_name')}</label>
            <input
              type="text"
              value={formData.condoName}
              onChange={(e) => setFormData({ ...formData, condoName: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.currency')}</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            >
              <option value="USD">USD</option>
              <option value="VES">VES</option>
              <option value="EUR">EUR</option>
              <option value="COP">COP</option>
              <option value="CLP">CLP</option>
              <option value="ARS">ARS</option>
              <option value="PEN">PEN</option>
              <option value="MXN">MXN</option>
            </select>
          </div>
        </div>
        {/* 🆕 Tasa de cambio */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('fields.exchange_rate')}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.exchangeRate}
              onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">{t('fields.exchange_rate_help')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('fields.exchange_rate_date')}
            </label>
            <input
              type="date"
              value={formData.exchangeRateDate}
              onChange={(e) => setFormData({ ...formData, exchangeRateDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Billing */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('billing')}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.issue_day')}</label>
            <input
              type="number"
              value={formData.issueDay}
              onChange={(e) => setFormData({ ...formData, issueDay: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              min="1"
              max="28"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.due_day')}</label>
            <input
              type="number"
              value={formData.dueDay}
              onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              min="1"
              max="31"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.late_fee')}</label>
            <input
              type="number"
              step="0.1"
              value={formData.lateFee}
              onChange={(e) => setFormData({ ...formData, lateFee: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Reservations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('reservations')}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.reservation_days')}</label>
            <input
              type="number"
              value={formData.reservationDays}
              onChange={(e) => setFormData({ ...formData, reservationDays: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.reservation_start')}</label>
            <input
              type="time"
              value={formData.reservationStart}
              onChange={(e) => setFormData({ ...formData, reservationStart: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.reservation_end')}</label>
            <input
              type="time"
              value={formData.reservationEnd}
              onChange={(e) => setFormData({ ...formData, reservationEnd: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('security')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.login_attempts')}</label>
            <input
              type="number"
              value={formData.loginAttempts}
              onChange={(e) => setFormData({ ...formData, loginAttempts: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              min="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.session_timeout')}</label>
            <input
              type="number"
              value={formData.sessionTimeout}
              onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
              min="5"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? t('saving') : t('save')}
        </button>
      </div>
    </form>
  );
}