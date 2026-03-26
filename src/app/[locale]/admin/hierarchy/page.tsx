'use client';

import { useTranslations } from 'next-intl';
import AdminLayout from '@/components/admin/AdminLayout';
import HierarchyManager from '@/components/admin/HierarchyManager';

export default function AdminHierarchyPage() {
  const t = useTranslations('admin');

  return (
    <AdminLayout title={t('hierarchy.title')}>
      <HierarchyManager />
    </AdminLayout>
  );
}
