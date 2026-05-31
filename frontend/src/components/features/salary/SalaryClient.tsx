'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Loader2, Calculator, CheckCircle, FileText, Settings, Download } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import SalaryConfigModal from './SalaryConfigModal';

export default function SalaryClient() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/payroll?month=${month}&year=${year}`);
      setPayrolls(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerate = async () => {
    if (!confirm(`Tạo bảng lương cho tháng ${month}/${year}? Thao tác này sẽ ghi đè các bản nháp cũ.`)) return;
    setGenerating(true);
    try {
      await axiosInstance.post('/payroll/calculate-all', { month, year });
      alert('Tạo bảng lương thành công!');
      fetchData();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = async (id: string) => {
    if (!confirm('Chốt bảng lương này? Sau khi chốt sẽ không thể tính lại.')) return;
    try {
      await axiosInstance.patch(`/payroll/${id}/confirm`);
      fetchData();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleExportPDF = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/payroll/${id}/export-pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `phieu-luong-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('Lỗi xuất PDF');
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tính lương Nhân viên"
        description="Phân hệ chốt lương, duyệt bảng lương và quản lý thu nhập hàng tháng."
        actions={
          <div className="flex items-center gap-3">
            <button onClick={() => setShowConfig(true)}
              className="bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-transform active:scale-95">
              <Settings className="w-5 h-5" /> Cấu hình đơn giá
            </button>
            <button onClick={handleGenerate} disabled={generating}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50">
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calculator className="w-5 h-5" />}
              Tạo bảng lương
            </button>
          </div>
        }
      />

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full sm:w-auto border border-gray-200 py-2.5 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium">
          {Array.from({length: 12}).map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full sm:w-auto border border-gray-200 py-2.5 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium">
          {[2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-100 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Nhân viên</th>
              <th className="px-6 py-4">Lương cơ bản</th>
              <th className="px-6 py-4">Thưởng</th>
              <th className="px-6 py-4">Phạt</th>
              <th className="px-6 py-4 text-gray-900">Thực nhận</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="p-12 text-center text-gray-400">Đang tải bảng lương...</td></tr>
            ) : payrolls.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-400">
                  <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                  <p>Chưa có bảng lương tháng này. Hãy bấm "Tạo bảng lương".</p>
                </td>
              </tr>
            ) : payrolls.map(p => (
              <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{p.employee?.fullName}</p>
                  <p className="text-xs text-gray-400">{p.totalHours} giờ x {formatCurrency(p.hourlyRate)}</p>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-600">{formatCurrency(p.baseSalary)}</td>
                <td className="px-6 py-4 font-semibold text-green-600">+{formatCurrency(p.bonusTotal)}</td>
                <td className="px-6 py-4 font-semibold text-red-600">-{formatCurrency(p.penaltyTotal)}</td>
                <td className="px-6 py-4 font-extrabold text-blue-700 text-lg">{formatCurrency(p.netSalary)}</td>
                <td className="px-6 py-4 text-center">
                  {p.status === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold"><CheckCircle className="w-3 h-3"/> Đã chốt</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-md text-xs font-bold">Bản nháp</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleExportPDF(p._id)} title="Xuất PDF"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    {p.status === 'draft' && (
                      <button onClick={() => handleConfirm(p._id)} title="Chốt lương"
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showConfig && <SalaryConfigModal onClose={() => setShowConfig(false)} />}
    </div>
  );
}
