import { cookies } from 'next/headers';
import PageHeader from '@/components/layout/PageHeader';
import { Users, FileText, Activity } from 'lucide-react';
import Link from 'next/link';

// Simple placeholder page for now to save tokens
export default async function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Báo cáo Thống kê" 
        description="Các số liệu tổng quan về nhân sự, chuyên cần và tài chính siêu thị."
      />

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 flex items-center justify-center rounded-full mb-6">
          <Activity className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Khu vực đang được phát triển</h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Các biểu đồ báo cáo và thống kê về lương thưởng (sử dụng Recharts) sẽ được hoàn thiện trong lộ trình tiếp theo.
        </p>
      </div>
    </div>
  );
}
