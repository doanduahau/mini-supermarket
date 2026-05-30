import { cookies } from 'next/headers';
import PageHeader from '@/components/layout/PageHeader';

export default async function SalaryPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tính lương Nhân viên" 
        description="Phân hệ chốt lương, duyệt bảng lương hàng tháng."
      />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
        Tính năng Tính lương & Cấu hình Đơn giá đang được triển khai.
      </div>
    </div>
  );
}
