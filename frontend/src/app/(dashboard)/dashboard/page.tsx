import { cookies } from 'next/headers';
import PageHeader from '@/components/layout/PageHeader';
import { Users, Calendar, ClipboardCheck, Wallet, CalendarDays, Clock, Banknote } from 'lucide-react';
import { Suspense } from 'react';

// Using fetch on server side with Authorization header via cookies
async function fetchStats() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  if (!token) return null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    // Fetch user info first
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    
    if (!meRes.ok) return null;
    const { data: user } = await meRes.json();
    
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    let stats: any = { role: user.role };

    if (user.role === 'supermarket_owner' || user.role === 'shift_manager') {
      const [headcountRes, salaryRes] = await Promise.all([
        fetch(`${baseUrl}/reports/headcount`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${baseUrl}/reports/salary-summary?month=${month}&year=${year}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      ]);
      
      const headcount = headcountRes.ok ? await headcountRes.json() : null;
      const salary = salaryRes.ok ? await salaryRes.json() : null;

      stats.headcount = headcount?.data?.active || 0;
      stats.todayShifts = 0; // Requires advanced query, mock for layout
      stats.missingCheckins = 0; // Mock for layout
      stats.totalSalary = salary?.data?.totalNetSalary || 0;
    } else {
      const [attendanceRes, salaryRes, scheduleRes] = await Promise.all([
        fetch(`${baseUrl}/my/attendance?month=${month}&year=${year}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${baseUrl}/my/estimated-salary?month=${month}&year=${year}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${baseUrl}/my/schedule?month=${month}&year=${year}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      ]);

      const attendance = attendanceRes.ok ? await attendanceRes.json() : null;
      const salary = salaryRes.ok ? await salaryRes.json() : null;
      const schedule = scheduleRes.ok ? await scheduleRes.json() : null;

      // Calculate weekly shifts from schedule (assignments within current week)
      let weeklyShiftsCount = 0;
      if (schedule?.data) {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))); // Monday
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        schedule.data.forEach((dayData: any) => {
          const d = new Date(dayData.date);
          if (d >= startOfWeek && d <= endOfWeek) {
            weeklyShiftsCount += dayData.assignments.filter((a: any) => a.status === 'approved').length;
          }
        });
      }

      stats.weeklyShifts = weeklyShiftsCount;
      stats.monthlyHours = attendance?.data?.summary?.totalHours || 0;
      stats.estimatedSalary = salary?.data?.netSalary || 0;
    }
    
    return stats;

  } catch (error) {
    return null;
  }
}

function StatCard({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: any, colorClass: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition-shadow duration-200">
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
      </div>
      <div className={`p-3.5 rounded-2xl ${colorClass} bg-opacity-10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between animate-pulse">
      <div className="space-y-4 w-full">
        <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>
      </div>
      <div className="w-14 h-14 bg-gray-100 rounded-2xl ml-4"></div>
    </div>
  );
}

async function DashboardContent() {
  const stats = await fetchStats();
  
  if (!stats) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-medium flex items-center justify-center">
        Lỗi kết nối hoặc không thể tải dữ liệu thống kê. Vui lòng làm mới trang.
      </div>
    );
  }

  const isManager = stats.role === 'supermarket_owner' || stats.role === 'shift_manager';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {isManager ? (
        <>
          <StatCard title="Nhân viên Active" value={stats.headcount} icon={Users} colorClass="text-blue-600 bg-blue-50" />
          <StatCard title="Ca hôm nay" value={stats.todayShifts} icon={Calendar} colorClass="text-purple-600 bg-purple-50" />
          <StatCard title="Chưa Check-in" value={stats.missingCheckins} icon={ClipboardCheck} colorClass="text-orange-600 bg-orange-50" />
          <StatCard title="Tổng Lương (Tháng)" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalSalary)} icon={Wallet} colorClass="text-emerald-600 bg-emerald-50" />
        </>
      ) : (
        <>
          <StatCard title="Ca tuần này" value={stats.weeklyShifts} icon={CalendarDays} colorClass="text-blue-600 bg-blue-50" />
          <StatCard title="Giờ làm tháng này" value={`${stats.monthlyHours}h`} icon={Clock} colorClass="text-amber-600 bg-amber-50" />
          <StatCard title="Thu nhập dự kiến" value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.estimatedSalary)} icon={Banknote} colorClass="text-emerald-600 bg-emerald-50" />
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tổng quan hệ thống" 
        description="Theo dõi các chỉ số quan trọng trong ngày của siêu thị."
      />
      
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
