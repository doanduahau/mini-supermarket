'use client';
import toast from 'react-hot-toast';

import React, { useState, useEffect, useCallback } from 'react';
import { Banknote, ChevronLeft, ChevronRight, TrendingUp, Clock, Gift, AlertTriangle, FileDown } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import PageHeader from '@/components/layout/PageHeader';

const fmtMoney = (n: number) => n?.toLocaleString('vi-VN') + ' VNĐ';

export default function MySalaryClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/my/estimated-salary', { params: { month, year } });
      setPayroll(data.data);
    } catch { setPayroll(null); } finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const handleExportPDF = async () => {
    if (!payroll?._id) return;
    setPdfLoading(true);
    try {
      const res = await axiosInstance.get(`/payroll/${payroll._id}/export-pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `phieu-luong-thang-${month}-${year}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Không thể xuất PDF.'); } finally { setPdfLoading(false); }
  };

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    draft:     { label: 'Tạm tính',  color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Đã chốt',   color: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <PageHeader title="Thu nhập của tôi" description="Xem dự tính và phiếu lương hàng tháng." />
        {payroll?._id && (
          <button onClick={handleExportPDF} disabled={pdfLoading}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50">
            {pdfLoading ? '...' : <><FileDown className="w-4 h-4" />Xuất PDF</>}
          </button>
        )}
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="flex-1 text-center font-extrabold text-gray-900 text-lg">Tháng {month}/{year}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : !payroll ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <Banknote className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-medium">Chưa có dữ liệu lương tháng này</p>
          <p className="text-sm mt-1">Bảng lương sẽ xuất hiện sau khi Quản lý tính lương</p>
        </div>
      ) : (
        <>
          {/* Status + Summary */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-blue-100 text-sm font-semibold">THỰC LĨNH THÁNG {month}/{year}</p>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_MAP[payroll.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                {STATUS_MAP[payroll.status]?.label || payroll.status}
              </span>
            </div>
            <p className="text-4xl font-extrabold tracking-tight">{fmtMoney(payroll.netSalary || 0)}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-blue-500/30">
              <div>
                <p className="text-blue-200 text-xs">Lương cơ bản</p>
                <p className="font-bold text-lg">{fmtMoney(payroll.baseSalary || 0)}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs">Thưởng</p>
                <p className="font-bold text-lg text-green-300">+{fmtMoney(payroll.bonusTotal || 0)}</p>
              </div>
              <div>
                <p className="text-blue-200 text-xs">Phạt</p>
                <p className="font-bold text-lg text-red-300">-{fmtMoney(payroll.penaltyTotal || 0)}</p>
              </div>
            </div>
          </div>

          {/* Detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: <Clock className="w-5 h-5" />, label: 'Tổng giờ làm', value: `${payroll.totalHours || 0} giờ`, color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: <TrendingUp className="w-5 h-5" />, label: 'Đơn giá/giờ', value: fmtMoney(payroll.hourlyRate || 0), color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { icon: <Gift className="w-5 h-5" />, label: 'Số khoản thưởng/phạt', value: `${(payroll.breakdown?.bonusRecords?.length || 0)} khoản`, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`${c.bg} ${c.color} p-2.5 rounded-xl`}>{c.icon}</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{c.label}</p>
                  <p className={`font-extrabold ${c.color}`}>{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bonus/Penalty detail */}
          {payroll.breakdown?.bonusRecords?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Gift className="w-4 h-4 text-purple-500" />Chi tiết Thưởng / Phạt</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {payroll.breakdown.bonusRecords.map((b: any, i: number) => (
                  <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {b.type === 'bonus'
                        ? <Gift className="w-4 h-4 text-green-500" />
                        : <AlertTriangle className="w-4 h-4 text-red-500" />}
                      <p className="text-sm text-gray-700">{b.reason || (b.type === 'bonus' ? 'Thưởng' : 'Phạt')}</p>
                    </div>
                    <span className={`font-bold text-sm ${b.type === 'bonus' ? 'text-green-600' : 'text-red-600'}`}>
                      {b.type === 'bonus' ? '+' : '-'}{fmtMoney(b.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
