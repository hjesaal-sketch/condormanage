'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ExchangeRateDisplay() {
  const t = useTranslations('billing');
  const [rate, setRate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRate();
  }, []);

  const fetchRate = async () => {
    try {
      const res = await fetch('/api/billing/rates');
      const data = await res.json();
      if (data.success) setRate(data.rate);
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">{t('loading_rate')}</div>;
  }

  if (!rate) {
    return <div className="text-sm text-gray-500">{t('rate_unavailable')}</div>;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
      <p className="font-medium">{t('exchange_rate')}</p>
      <div className="flex gap-4 mt-1">
        <span>USD: <strong>{rate.usd.toFixed(2)}</strong></span>
        <span>EUR: <strong>{rate.eur.toFixed(2)}</strong></span>
        <span className="text-gray-500 text-xs">
          {t('updated')}: {new Date(rate.updated_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}