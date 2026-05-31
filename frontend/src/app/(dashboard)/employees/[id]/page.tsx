import { cookies } from 'next/headers';
import PageHeader from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { User, Phone, Mail, Calendar as CalendarIcon, ArrowLeft, Briefcase, FileText } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: any) {
  return { title: 'Hồ sơ Nhân viên | Mini HR' };
}

export default async function EmployeeDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  
  if (!res.ok) {
    console.log('Employee API failed:', res.status, await res.text());
    return (
      <div className="p-10 flex flex-col items-center justify-center bg-white rounded-3xl border border-red-100 shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy nhân viên</h2>
        <p className="text-gray-500 mb-6">Thông tin nhân viên này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
        <Link href="/employees" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-colors">
          Quay lại danh sách
        </Link>
      </div>
    );
  }
  
  const { data: emp } = await res.json();

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <Link href="/employees" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay lại danh sách
      </Link>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover & Profile Info */}
        <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="px-6 sm:px-10 pb-8">
          <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-end -mt-16 sm:-mt-12 mb-8 gap-4">
            <div className="flex items-end gap-5">
              <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-xl border border-gray-50">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-4xl font-extrabold text-blue-700">
                  {emp.fullName.charAt(0)}
                </div>
              </div>
              <div className="pb-3 hidden sm:block">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{emp.fullName}</h1>
                <p className="text-gray-500 font-medium mt-1">{emp.email}</p>
              </div>
            </div>
            <div className="pb-3 flex gap-2">
              <Badge color={emp.role === 'supermarket_owner' ? 'purple' : emp.role === 'shift_manager' ? 'blue' : 'gray'}>
                {emp.role === 'supermarket_owner' ? 'Chủ siêu thị' : emp.role === 'shift_manager' ? 'Quản lý ca' : 'Nhân viên'}
              </Badge>
              <Badge color={emp.status === 'active' ? 'green' : 'red'}>
                {emp.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
              </Badge>
            </div>
          </div>
          
          <div className="sm:hidden mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">{emp.fullName}</h1>
            <p className="text-gray-500 font-medium">{emp.email}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Email liên lạc</span>
              </div>
              <p className="font-semibold text-gray-900 truncate">{emp.email}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Số điện thoại</span>
              </div>
              <p className="font-semibold text-gray-900">{emp.phone || 'Chưa cập nhật'}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Ngày gia nhập</span>
              </div>
              <p className="font-semibold text-gray-900">{formatDate(emp.createdAt)}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">ID Hồ sơ</span>
              </div>
              <p className="font-medium text-gray-500 text-sm truncate">{emp._id}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs Layout */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button className="border-b-2 border-blue-600 py-4 px-1 text-sm font-bold text-blue-600 flex items-center gap-2">
              <User className="w-4 h-4" /> Thông tin chung
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center gap-2 transition-colors">
              <Briefcase className="w-4 h-4" /> Lịch làm việc
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:border-gray-300 flex items-center gap-2 transition-colors">
              <FileText className="w-4 h-4" /> Lịch sử chấm công
            </button>
          </nav>
        </div>
        <div className="p-8 text-center text-gray-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Tính năng đang hoàn thiện</h3>
          <p className="text-sm">Tab này sẽ sớm hiển thị lịch sử ca làm việc và điểm danh của nhân sự.</p>
        </div>
      </div>
    </div>
  );
}
