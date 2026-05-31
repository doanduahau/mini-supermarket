'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import axiosInstance from '@/lib/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Loader2, Users, Banknote, Clock, Target, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportClient() {
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [salaryData, setSalaryData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [headcountData, setHeadcountData] = useState<any>(null);
  const [shiftData, setShiftData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [salRes, attRes, hcRes, shRes] = await Promise.all([
        axiosInstance.get(`/reports/salary-summary?month=${month}&year=${year}`),
        axiosInstance.get(`/reports/attendance-summary?month=${month}&year=${year}`),
        axiosInstance.get('/reports/headcount'),
        axiosInstance.get(`/reports/shift-utilization?month=${month}&year=${year}`)
      ]);

      setSalaryData(salRes.data.data);
      setAttendanceData(attRes.data.data);
      setHeadcountData(hcRes.data.data);
      setShiftData(shRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !salaryData || !attendanceData || !headcountData || !shiftData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tổng hợp dữ liệu báo cáo...</p>
      </div>
    );
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Prepare chart data
  const roleChartData = headcountData.byRole.map((r: any) => ({
    name: r.role === 'employee' ? 'Nhân viên' : r.role === 'shift_manager' ? 'Quản lý' : 'Chủ',
    value: r.active
  }));

  const salaryComposition = [
    { name: 'Lương cơ bản', value: salaryData.totalBaseSalary },
    { name: 'Thưởng', value: salaryData.totalBonus },
  ];

  const shiftChartData = shiftData.map((s: any) => ({
    name: s.shift.name,
    'Tỷ lệ lấp đầy (%)': s.utilizationRate
  }));

  const attendanceChartData = attendanceData.employees
    .sort((a: any, b: any) => b.totalHours - a.totalHours)
    .slice(0, 5) // Top 5
    .map((e: any) => ({
      name: e.employee.fullName.split(' ').slice(-2).join(' '),
      'Giờ làm': e.totalHours,
      'Đi trễ': e.lateDays
    }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader title="Báo cáo Thống kê" description="Phân tích toàn diện tình hình nhân sự và tài chính." />
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-gray-50 border-none rounded-xl px-4 py-2 font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
            {Array.from({length: 12}).map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-gray-50 border-none rounded-xl px-4 py-2 font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-6 h-6" /></div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+{headcountData.newThisMonth} tháng này</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Nhân sự Active</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{headcountData.active} <span className="text-base font-medium text-gray-400">/ {headcountData.total}</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><Banknote className="w-6 h-6" /></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Tổng chi lương Net</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{formatCurrency(salaryData.totalNetSalary)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Clock className="w-6 h-6" /></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Tổng giờ làm việc</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{salaryData.totalHours} <span className="text-base font-medium text-gray-400">giờ</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Target className="w-6 h-6" /></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Tỷ lệ chuyên cần</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{attendanceData.summary.avgAttendanceRate}%</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Headcount by Role */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            Cơ cấu nhân sự <span className="text-xs font-normal text-gray-500">(Theo vai trò)</span>
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                  {roleChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Shift Utilization */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            Hiệu suất lấp đầy ca làm việc
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="Tỷ lệ lấp đầy (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Employees by Hours */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            Top 5 Nhân viên (Giờ làm & Đi trễ)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Legend />
                <Bar yAxisId="left" dataKey="Giờ làm" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar yAxisId="right" dataKey="Đi trễ" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Financial Details */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" /> Bảng Vinh Danh & Thống kê Tài chính
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase">Top Thu Nhập Tháng</h4>
            <div className="space-y-3">
              {salaryData.topEarners.map((emp: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <span className="font-semibold text-gray-900">{emp.fullName}</span>
                  </div>
                  <span className="font-extrabold text-blue-600">{formatCurrency(emp.netSalary)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase">Cấu thành quỹ lương</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Lương cơ bản</span>
                <span className="font-bold text-gray-900">{formatCurrency(salaryData.totalBaseSalary)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Tổng thưởng (+)</span>
                <span className="font-bold text-green-600">+{formatCurrency(salaryData.totalBonus)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Tổng phạt (-)</span>
                <span className="font-bold text-red-600">-{formatCurrency(salaryData.totalPenalty)}</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Tổng chi ròng</span>
                <span className="text-xl font-extrabold text-blue-600">{formatCurrency(salaryData.totalNetSalary)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
