'use client';

import { useTranslations } from 'next-intl';
import AdminLayout from '@/components/admin/AdminLayout';
import PartsManager from '@/components/admin/PartsManager';

export default function AdminPartsPage() {
  const t = useTranslations('admin');

  return (
    <AdminLayout title={t('parts.title')}>
      <PartsManager />
    </AdminLayout>
  );
}
