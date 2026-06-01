'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, Search, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Edit3, X, History } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import PageHeader from '@/components/layout/PageHeader';

interface Attendance {
  _id: string;
  employee: { _id: string; fullName: string; email: string; role: string };
  shift: { _id: string; name: string; startTime: string; endTime: string };
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  actualHours: number;
  status: string;
  note: string;
  editHistory?: any[];
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  present:   { label: 'Đúng giờ',  color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  late:      { label: 'Đi muộn',   color: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  absent:    { label: 'Vắng mặt',  color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
  pending:   { label: 'Chưa vào',  color: 'bg-gray-100 text-gray-600', icon: <Clock className="w-3.5 h-3.5" /> },
};

function fmt(dt: string | null) {
  if (!dt) return '—';
  return new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

interface EditModalProps {
  record: Attendance;
  onClose: () => void;
  onSave: () => void;
}

function EditModal({ record, onClose, onSave }: EditModalProps) {
  const [checkIn, setCheckIn] = useState(record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '');
  const [checkOut, setCheckOut] = useState(record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '');
  const [note, setNote] = useState(record.note || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const dateBase = new Date(record.date).toISOString().split('T')[0];
      const body: any = { note };
      if (checkIn) body.checkInTime = new Date(`${dateBase}T${checkIn}:00`).toISOString();
      if (checkOut) body.checkOutTime = new Date(`${dateBase}T${checkOut}:00`).toISOString();
      await axiosInstance.put(`/attendance/${record._id}`, body);
      onSave();
      onClose();
    } catch (e) {
      alert('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-900">Cập nhật chấm công</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="font-semibold text-gray-900">{record.employee?.fullName}</p>
            <p className="text-gray-500">{record.shift?.name} — {fmtDate(record.date)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Giờ vào</label>
              <input type="time" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Giờ ra</label>
              <input type="time" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Ghi chú</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Lý do chỉnh sửa..." />
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Hủy</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryModal({ record, onClose }: { record: Attendance; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" /> Lịch sử chỉnh sửa
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {(!record.editHistory || record.editHistory.length === 0) ? (
            <p className="text-gray-500 text-center text-sm">Chưa có lịch sử chỉnh sửa nào.</p>
          ) : (
            <div className="space-y-4">
              {record.editHistory.map((h, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-sm text-gray-900">{h.updatedBy?.fullName || 'Hệ thống'}</p>
                    <span className="text-xs text-gray-500">{fmt(h.updatedAt)} {fmtDate(h.updatedAt)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 italic">"{h.note}"</p>
                  <div className="bg-white p-2 rounded-lg border border-gray-100 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-gray-400">Vào (cũ):</span> {fmt(h.oldCheckIn)}</div>
                      <div><span className="text-gray-400">Vào (mới):</span> <span className="text-blue-600">{fmt(h.newCheckIn)}</span></div>
                      <div><span className="text-gray-400">Ra (cũ):</span> {fmt(h.oldCheckOut)}</div>
                      <div><span className="text-gray-400">Ra (mới):</span> <span className="text-blue-600">{fmt(h.newCheckOut)}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AttendanceClient() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editRecord, setEditRecord] = useState<Attendance | null>(null);
  const [historyRecord, setHistoryRecord] = useState<Attendance | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (date) params.date = date;
      const { data } = await axiosInstance.get('/attendance', { params });
      setAttendances(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) {
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  }, [date, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCheckIn = async (id: string) => {
    try {
      await axiosInstance.patch(`/attendance/${id}/checkin`, { checkInTime: new Date().toISOString() });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in thất bại!');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await axiosInstance.patch(`/attendance/${id}/checkout`, { checkOutTime: new Date().toISOString() });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-out thất bại!');
    }
  };

  const filtered = attendances.filter(a =>
    !search || a.employee?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: attendances.length,
    present: attendances.filter(a => a.checkIn).length,
    absent: attendances.filter(a => !a.checkIn).length,
    checkedOut: attendances.filter(a => a.checkOut).length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader title="Chấm công" description="Theo dõi và ghi nhận thời gian làm việc của nhân viên theo ca." />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng ca hôm nay', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50', icon: <ClipboardCheck className="w-5 h-5" /> },
          { label: 'Đã vào làm', value: stats.present, color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle2 className="w-5 h-5" /> },
          { label: 'Đã về', value: stats.checkedOut, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <Clock className="w-5 h-5" /> },
          { label: 'Chưa vào', value: stats.absent, color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle className="w-5 h-5" /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}>{s.icon}</div>
            <div>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1); }}
            className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="Tìm tên nhân viên..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={fetchData} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-500">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Nhân viên', 'Ca làm việc', 'Ngày', 'Giờ vào', 'Giờ ra', 'Số giờ', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p>Không có dữ liệu chấm công</p>
                </td></tr>
              ) : filtered.map(a => {
                const status = a.checkOut ? 'present' : a.checkIn ? 'late' : 'pending';
                const st = STATUS_MAP[status] || STATUS_MAP['pending'];
                return (
                  <tr key={a._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-semibold text-gray-900">{a.employee?.fullName}</p>
                        <p className="text-xs text-gray-400">{a.employee?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-semibold">{a.shift?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{fmtDate(a.date)}</td>
                    <td className="px-4 py-3.5">
                      {a.checkIn ? (
                        <span className="font-mono font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-lg text-xs">{fmt(a.checkIn)}</span>
                      ) : (
                        <button onClick={() => handleCheckIn(a._id)}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                          Check-in
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {a.checkOut ? (
                        <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg text-xs">{fmt(a.checkOut)}</span>
                      ) : a.checkIn ? (
                        <button onClick={() => handleCheckOut(a._id)}
                          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                          Check-out
                        </button>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      {a.actualHours > 0 ? (
                        <span className="font-bold text-gray-900">{a.actualHours.toFixed(1)}<span className="text-xs font-normal text-gray-400 ml-1">giờ</span></span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}>
                        {st.icon}{st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditRecord(a)} title="Sửa giờ"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {a.editHistory && a.editHistory.length > 0 && (
                          <button onClick={() => setHistoryRecord(a)} title="Lịch sử sửa"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative">
                            <History className="w-4 h-4" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-500">Trang {page} / {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-2 border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {editRecord && (
        <EditModal record={editRecord} onClose={() => setEditRecord(null)} onSave={fetchData} />
      )}
      {historyRecord && (
        <HistoryModal record={historyRecord} onClose={() => setHistoryRecord(null)} />
      )}
    </div>
  );
}
