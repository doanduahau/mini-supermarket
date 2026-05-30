import { cookies } from 'next/headers';
import PageHeader from '@/components/layout/PageHeader';

export default async function MySchedulePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Lịch làm việc của tôi" />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
        Tính năng đăng ký ca cá nhân đang được triển khai.
      </div>
    </div>
  );
}
