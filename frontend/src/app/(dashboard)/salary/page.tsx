import PageHeader from '@/components/layout/PageHeader';
import ExportExcelButton from '@/components/features/salary/ExportExcelButton';

export default async function SalaryPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Tính lương Nhân viên" 
          description="Phân hệ chốt lương, xuất file Excel và duyệt bảng lương hàng tháng."
        />
        <div className="flex items-center gap-3">
          <ExportExcelButton month={currentMonth} year={currentYear} />
          {/* Nút Tính lương tất cả sẽ được xây dựng sau */}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
        Bảng chi tiết Tính lương & Cấu hình Đơn giá đang được triển khai...
      </div>
    </div>
  );
}
