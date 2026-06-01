'use client';
import toast from 'react-hot-toast';

import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, Plus, X, Loader2, Users } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import PageHeader from '@/components/layout/PageHeader';

interface Assignment {
  _id: string;
  shift: { _id: string; name: string; startTime: string; endTime: string };
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
}

interface DayData { date: string; assignments: Assignment[] }

const STATUS_MAP = {
  pending:  { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <AlertCircle className="w-3 h-3" /> },
  approved: { label: 'Đã duyệt',  color: 'bg-green-100 text-green-700 border-green-200',   icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { label: 'Từ chối',   color: 'bg-red-100 text-red-700 border-red-200',         icon: <XCircle className="w-3 h-3" /> },
};

function RegisterModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<{ date: string; shiftId: string }[]>([]);

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextSunday.getDate() + 6);
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    const sDate = `${nextMonday.getFullYear()}-${pad(nextMonday.getMonth() + 1)}-${pad(nextMonday.getDate())}`;
    const eDate = `${nextSunday.getFullYear()}-${pad(nextSunday.getMonth() + 1)}-${pad(nextSunday.getDate())}`;

    axiosInstance.get('/my/shift-availability', { params: { startDate: sDate, endDate: eDate } })
      .then(({ data }) => { setAvailability(data.data || []); setLoading(false); })
      .catch(() => { setError('Không thể tải dữ liệu ca trực.'); setLoading(false); });
  }, []);

  const toggleSelection = (date: string, shiftId: string) => {
    setSelected(prev => {
      const exists = prev.find(p => p.date === date && p.shiftId === shiftId);
      if (exists) return prev.filter(p => p.date !== date || p.shiftId !== shiftId);
      
      // Enforce max 2 shifts per day in UI
      const countForDay = prev.filter(p => p.date === date).length;
      if (countForDay >= 2) {
        toast.error('Chỉ được chọn tối đa 2 ca trong 1 ngày.');
        return prev;
      }
      return [...prev, { date, shiftId }];
    });
  };

  const handleSubmit = async () => {
    if (selected.length === 0) { setError('Vui lòng chọn ít nhất 1 ca.'); return; }
    setSubmitting(true); setError('');
    try {
      await axiosInstance.post('/my/shift-register/bulk', { assignments: selected });
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đăng ký thất bại.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-xl text-gray-900">Đăng ký ca làm việc (Tuần tới)</h2>
            <p className="text-sm text-gray-500 mt-1">Chọn các ca bạn muốn làm việc trong tuần tới. Có thể chọn tối đa 2 ca/ngày.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200 mb-4 font-medium">{error}</div>}
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
              <p>Đang tải dữ liệu ca trống...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availability.map((dayData, idx) => {
                const dateObj = new Date(dayData.date);
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                return (
                  <div key={dayData.date} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
                    <div className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between ${isWeekend ? 'bg-blue-50/50' : 'bg-white'}`}>
                      <div>
                        <p className={`font-bold ${isWeekend ? 'text-blue-700' : 'text-gray-900'}`}>
                          {dateObj.toLocaleDateString('vi-VN', { weekday: 'long' })}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{dateObj.toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="p-3 space-y-2 flex-1">
                      {dayData.shifts.map((s: any) => {
                        const isSelected = selected.some(sel => sel.date === dayData.date && sel.shiftId === s._id);
                        const isFull = s.availableCount <= 0;
                        const isAlreadyRegistered = s.isRegisteredByMe;
                        
                        return (
                          <div 
                            key={s._id} 
                            onClick={() => !isFull && !isAlreadyRegistered && toggleSelection(dayData.date, s._id)}
                            className={`p-3 rounded-xl border-2 transition-all relative overflow-hidden ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50/30 cursor-pointer' 
                                : isAlreadyRegistered
                                  ? 'border-transparent bg-gray-100 opacity-60 cursor-not-allowed'
                                  : isFull
                                    ? 'border-transparent bg-red-50 opacity-60 cursor-not-allowed'
                                    : 'border-transparent bg-white hover:border-blue-200 shadow-sm cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className={`font-bold text-sm ${isSelected || isAlreadyRegistered ? 'text-blue-700' : 'text-gray-900'}`}>{s.name}</p>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                              {isAlreadyRegistered && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Đã ĐK</span>}
                            </div>
                            <p className="text-xs text-gray-500 font-medium mb-2.5 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> {s.startTime} - {s.endTime}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex -space-x-1">
                                {Array.from({ length: Math.min(3, s.registeredCount) }).map((_, i) => (
                                  <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                                    <Users className="w-2.5 h-2.5 text-blue-600" />
                                  </div>
                                ))}
                                {s.registeredCount > 3 && (
                                  <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600">
                                    +{s.registeredCount - 3}
                                  </div>
                                )}
                              </div>
                              <span className={`font-semibold px-2 py-0.5 rounded-md ${
                                isFull ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                              }`}>
                                {s.registeredCount}/{s.maxEmployees}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-5 border-t border-gray-100 shrink-0 bg-gray-50/50 rounded-b-2xl flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600">Đã chọn: <span className="text-blue-600 font-extrabold text-lg">{selected.length}</span> ca</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors text-sm">Hủy</button>
            <button 
              onClick={handleSubmit} 
              disabled={submitting || selected.length === 0}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center gap-2 text-sm"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Gửi đề xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyScheduleClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [schedule, setSchedule] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [canRegister, setCanRegister] = useState(true);
  const [registerDate, setRegisterDate] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/my/schedule', { params: { month, year } });
      setSchedule(data.data || []);
    } catch { setSchedule([]); }
    finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { 
    fetchSchedule(); 
    axiosInstance.get('/settings/public').then(({ data }) => {
      if (data.data?.shiftRegistrationDate) {
        const todayStr = new Date().toLocaleDateString('en-CA'); // local timezone YYYY-MM-DD
        setRegisterDate(data.data.shiftRegistrationDate);
        setCanRegister(data.data.shiftRegistrationDate === todayStr);
      }
    }).catch(() => {});
  }, [fetchSchedule]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const totalApproved = schedule.reduce((acc, d) => acc + d.assignments.filter(a => a.status === 'approved').length, 0);
  const totalPending  = schedule.reduce((acc, d) => acc + d.assignments.filter(a => a.status === 'pending').length, 0);
  const totalDays     = new Set(schedule.filter(d => d.assignments.some(a => a.status === 'approved')).map(d => d.date)).size;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <PageHeader title="Lịch làm việc của tôi" description="Xem lịch và đăng ký ca làm việc." />
          {registerDate && !canRegister && (
            <p className="text-sm text-red-600 font-medium mt-1 bg-red-50 px-3 py-1.5 rounded-lg inline-block">
              Ngày đăng ký ca kế tiếp: {new Date(registerDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          )}
        </div>
        <button 
          onClick={() => {
            if (canRegister) setShowRegister(true);
            else toast.error(`Chưa đến ngày đăng ký ca. Ngày được phép đăng ký là: ${new Date(registerDate!).toLocaleDateString('vi-VN')}`);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
            canRegister ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}>
          <Plus className="w-4 h-4" /> Đăng ký ca
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Ngày có ca', value: totalDays, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ca đã duyệt', value: totalApproved, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Chờ duyệt', value: totalPending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Month nav */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="font-extrabold text-gray-900 text-lg">Tháng {month}/{year}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)
          ) : schedule.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="font-medium">Chưa có lịch làm việc trong tháng này</p>
              <p className="text-sm mt-1">Nhấn "Đăng ký ca" để đăng ký ca làm việc</p>
            </div>
          ) : schedule.map(day => (
            <div key={day.date} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-center min-w-[48px]">
                <p className="text-2xl font-extrabold text-gray-900">{new Date(day.date).getUTCDate()}</p>
                <p className="text-xs text-gray-400 font-medium">
                  {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' })}
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {day.assignments.map(a => {
                  const st = STATUS_MAP[a.status] || STATUS_MAP.pending;
                  return (
                    <div key={a._id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2.5 border border-gray-100 group">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{a.shift?.name}</p>
                          <p className="text-xs text-gray-500">{a.shift?.startTime} – {a.shift?.endTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.color}`}>
                          {st.icon}{st.label}
                        </span>
                        {a.status === 'pending' && (
                          <button
                            onClick={async () => {
                              if (confirm('Bạn có chắc muốn hủy ca này không?')) {
                                try {
                                  await axiosInstance.delete(`/my/shift-register/${a._id}`);
                                  fetchSchedule();
                                } catch (err: any) {
                                  toast.error(err?.response?.data?.message || 'Không thể hủy ca');
                                }
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Hủy đăng ký"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSuccess={fetchSchedule} />}
    </div>
  );
}
