'use client';

import { useTranslations } from 'next-intl';
import { Instagram, User } from 'lucide-react';
import Link from 'next/link';

export default function Credits() {
  const t = useTranslations('credits');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg px-4 py-2 text-xs text-gray-500 hover:shadow-xl transition-shadow">
        <p className="font-medium text-gray-700">{t('developed_by')}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <Link
            href="https://eos-connecting.vercel.app/index.html#home"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
          >
            Eos Connecting
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">Henry Esaá</span>
          <Link
            href="https://www.instagram.com/eosconnecting/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-800 transition-colors ml-1"
            aria-label="Instagram"
          >
            <Instagram className="w-3.5 h-3.5 inline" />
          </Link>
          <Link
            href="https://www.threads.com/@eosconnecting"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Threads"
          >
            <User className="w-3.5 h-3.5 inline" />
          </Link>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">{t('version')} 1.0.0</p>
      </div>
    </div>
  );
}