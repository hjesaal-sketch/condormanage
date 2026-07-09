'use client';

import { useTranslations } from 'next-intl';
import { User, Mail, Phone, FileText, Home, Eye, Edit, Trash2 } from 'lucide-react';

interface ResidentCardProps {
  resident: any;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export default function ResidentCard({ resident, onEdit, onDelete, onView }: ResidentCardProps) {
  const t = useTranslations('residents');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{resident.name}</h3>
            <p className="text-sm text-gray-500">{resident.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onView && (
            <button
              onClick={onView}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={t('view')}
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title={t('edit')}
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t('delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1 text-sm text-gray-600">
        {resident.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{resident.phone}</span>
          </div>
        )}
        {resident.document && (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span>{resident.document}</span>
          </div>
        )}
        {resident.unit_user_rel?.[0]?.unit_id && (
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-gray-400" />
            <span>
              {t('unit')}: {resident.unit_user_rel[0].unit_id}
            </span>
          </div>
        )}
      </div>

      {resident.unit_user_rel?.[0]?.relationship && (
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            {t(`relationships.${resident.unit_user_rel[0].relationship}`)}
          </span>
        </div>
      )}
    </div>
  );
}