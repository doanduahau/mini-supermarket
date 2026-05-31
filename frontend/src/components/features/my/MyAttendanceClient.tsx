'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import PageHeader from '@/components/layout/PageHeader';

interface AttRecord { _id: string; shift: { name: string; startTime: string; endTime: string }; date: string; checkIn: string | null; checkOut: string | null; actualHours: number; }
interface Summary { totalDays: number; totalHours: number; presentDays: number; absentDays: number }

const fmt = (dt: string | null) => dt ? new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';

export default function MyAttendanceClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState<AttRecord[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalDays: 0, totalHours: 0, presentDays: 0, absentDays: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/my/attendance', { params: { month, year, page, limit: 15 } });
      setRecords(data.data?.attendance || []);
      setSummary(data.data?.summary || {});
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { setRecords([]); } finally { setLoading(false); }
  }, [month, year, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => { setPage(1); if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { setPage(1); if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const handleCheckIn = async (id: string) => {
    try {
      await axiosInstance.patch(`/my/attendance/${id}/checkin`);
      fetchData();
    } catch (err: any) { alert(err?.response?.data?.message || 'Chấm công thất bại'); }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await axiosInstance.patch(`/my/attendance/${id}/checkout`);
      fetchData();
    } catch (err: any) { alert(err?.response?.data?.message || 'Chấm công thất bại'); }
  };

  const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader title="Chấm công của tôi" description="Lịch sử check-in / check-out hàng ngày." />

      {/* Quick Check-in Banner */}
      {month === now.getMonth() + 1 && year === now.getFullYear() && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Hành động hôm nay ({now.toLocaleDateString('vi-VN')})</h3>
              {records.filter(r => isToday(r.date)).length === 0 && (
                <p className="text-sm text-gray-500 mt-1">Hôm nay bạn không có ca làm việc nào được phân công.</p>
              )}
            </div>
          </div>

          {records.filter(r => isToday(r.date)).length > 0 && (
            <div className="space-y-3">
              {records.filter(r => isToday(r.date)).map(r => (
                <div key={r._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl p-4 border border-blue-50 shadow-sm gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Ca làm việc: <span className="font-semibold text-blue-700">{r.shift.name}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.shift.startTime} - {r.shift.endTime}</p>
                  </div>
                  <div className="flex gap-3">
                    {!r.checkIn ? (
                      <button onClick={() => handleCheckIn(r._id)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Bắt đầu ca (Vào)
                      </button>
                    ) : r.checkIn && !r.checkOut ? (
                      <button onClick={() => handleCheckOut(r._id)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Kết thúc ca (Ra)
                      </button>
                    ) : (
                      <div className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Đã hoàn thành ca
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng ca', value: summary.totalDays, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ngày đi làm', value: summary.presentDays, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Ngày vắng', value: summary.absentDays, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Tổng giờ', value: `${summary.totalHours}h`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <h2 className="font-extrabold text-gray-900">Tháng {month}/{year}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-xl transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Ngày', 'Ca làm việc', 'Giờ vào', 'Giờ ra', 'Số giờ', 'Trạng thái'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              )) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p>Không có dữ liệu chấm công trong tháng này</p>
                </td></tr>
              ) : records.map(r => (
                <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-gray-900">
                    {new Date(r.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold">{r.shift?.name || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {r.checkIn ? <span className="font-mono font-bold text-green-700 bg-green-50 px-2 py-1 rounded-lg text-xs">{fmt(r.checkIn)}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    {r.checkOut ? <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg text-xs">{fmt(r.checkOut)}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-gray-900">
                    {r.actualHours > 0 ? `${r.actualHours.toFixed(1)}h` : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    {isToday(r.date) && !r.checkIn ? (
                      <button onClick={() => handleCheckIn(r._id)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        Vào ca
                      </button>
                    ) : isToday(r.date) && r.checkIn && !r.checkOut ? (
                      <button onClick={() => handleCheckOut(r._id)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                        Ra ca
                      </button>
                    ) : r.checkIn ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" />Đã đến</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full"><XCircle className="w-3.5 h-3.5" />Vắng mặt</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-500">Trang {page}/{totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
