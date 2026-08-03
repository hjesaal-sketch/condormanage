'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download, Printer } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const t = useTranslations('accounting');
  const [selectedReport, setSelectedReport] = useState('balance-sheet');

  const reports = [
    { id: 'balance-sheet', name: t('balance_sheet') },
    { id: 'income-statement', name: t('income_statement') },
    { id: 'journal', name: 'Libro Diario' },
    { id: 'ledger', name: 'Libro Mayor' },
    { id: 'trial-balance', name: 'Balance de Sumas y Saldos' },
    { id: 'unit-statement', name: 'Estado de Cuenta por Unidad' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('reports')}</h1>
          <p className="text-gray-500">{t('description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selector de reportes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Reportes</h3>
          <div className="space-y-2">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedReport === report.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {report.name}
              </button>
            ))}
          </div>
        </div>

        {/* Vista del reporte */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-800">
              {reports.find(r => r.id === selectedReport)?.name}
            </h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-gray-500 text-center py-12">
              Selecciona un reporte para visualizar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}