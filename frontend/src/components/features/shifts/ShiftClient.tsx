'use client';

import React, { useState, useCallback } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, X, AlertTriangle, Loader2, Check, UserPlus } from 'lucide-react';
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';
import { vi } from 'date-fns/locale';
import axiosInstance from '@/lib/axios';

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  maxEmployees: number;
  description?: string;
}

// ─── Shift Form Modal ───────────────────────────────────────────────────────
function ShiftFormModal({
  shift,
  onClose,
  onSaved,
}: {
  shift?: Shift | null;
  onClose: () => void;
  onSaved: (s: Shift) => void;
}) {
  const isEdit = !!shift;
  const [form, setForm] = useState({
    name: shift?.name || '',
    startTime: shift?.startTime || '',
    endTime: shift?.endTime || '',
    maxEmployees: shift?.maxEmployees ?? 3,
    description: shift?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.startTime || !form.endTime) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = isEdit
        ? await axiosInstance.put(`/shifts/${shift!._id}`, form)
        : await axiosInstance.post('/shifts', form);
      onSaved(data.data);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-xl text-gray-900">{isEdit ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Tên ca <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="VD: Ca sáng, Ca chiều..." required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Giờ bắt đầu <span className="text-red-500">*</span></label>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Giờ kết thúc <span className="text-red-500">*</span></label>
              <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Số nhân viên tối đa <span className="text-red-500">*</span></label>
            <input type="number" min={1} max={20} value={form.maxEmployees}
              onChange={e => setForm(f => ({ ...f, maxEmployees: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Ghi chú thêm về ca..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo ca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ───────────────────────────────────────────────────
function ConfirmDeleteModal({
  shift,
  onClose,
  onDeleted,
}: {
  shift: Shift;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/shifts/${shift._id}`);
      onDeleted(shift._id);
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể xóa ca này!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="font-bold text-xl text-gray-900 mb-2">Xóa ca làm việc?</h2>
          <p className="text-gray-500 text-sm">
            Bạn có chắc muốn xóa ca <span className="font-bold text-gray-900">"{shift.name}"</span>?
            <br />Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Assignment Modal ──────────────────────────────────────────────────────────
function AssignmentModal({
  shift,
  date,
  assignments,
  onClose,
  onUpdateStatus,
  onAssign,
}: {
  shift: Shift;
  date: Date;
  assignments: any[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onAssign: (employeeId: string) => Promise<void>;
}) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    axiosInstance.get('/users?role=employee&limit=100').then(({ data }) => setEmployees(data.data || []));
  }, []);

  const handleAssign = async () => {
    if (!selectedEmp) return;
    setLoading(true);
    try {
      await onAssign(selectedEmp);
      setSelectedEmp('');
    } finally { setLoading(false); }
  };

  const pending = assignments.filter(a => a.status === 'pending');
  const approved = assignments.filter(a => a.status === 'approved');

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-xl text-gray-900">Phân công ca: {shift.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{format(date, 'EEEE, dd/MM/yyyy', { locale: vi })} ({shift.startTime} - {shift.endTime})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Approved Section */}
          <section>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" /> Nhân viên đã duyệt ({approved.length}/{shift.maxEmployees})
            </h3>
            {approved.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Chưa có ai.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {approved.map(a => (
                  <div key={a._id} className="border border-green-200 bg-green-50/50 p-3 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-green-600 text-xs shadow-sm">
                        {a.employee.fullName.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{a.employee.fullName}</p>
                    </div>
                    <button onClick={() => onUpdateStatus(a._id, 'rejected')} className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" title="Hủy ca">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Section */}
          {pending.length > 0 && (
            <section>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-500" /> Chờ duyệt ({pending.length})
              </h3>
              <div className="space-y-3">
                {pending.map(a => (
                  <div key={a._id} className="border border-yellow-200 bg-yellow-50/50 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-yellow-600 text-xs shadow-sm">
                        {a.employee.fullName.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{a.employee.fullName}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onUpdateStatus(a._id, 'approved')} disabled={approved.length >= shift.maxEmployees}
                        className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors disabled:opacity-50">
                        Duyệt
                      </button>
                      <button onClick={() => onUpdateStatus(a._id, 'rejected')}
                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors">
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Direct Assign */}
          <section>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <UserPlus className="w-4 h-4 text-blue-600" /> Chủ động xếp ca (Ép ca)
            </h3>
            <div className="flex gap-3">
              <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Chọn nhân viên --</option>
                {employees.filter(e => !approved.some(a => a.employee._id === e._id)).map(e => (
                  <option key={e._id} value={e._id}>{e.fullName}</option>
                ))}
              </select>
              <button onClick={handleAssign} disabled={loading || !selectedEmp || approved.length >= shift.maxEmployees}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gắn NV'}
              </button>
            </div>
            {approved.length >= shift.maxEmployees && <p className="text-xs text-red-500 mt-2">Ca này đã đủ nhân viên.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ShiftClient({ initialShifts }: { initialShifts: Shift[] }) {
  const { user } = useAuth();
  const isManager = user?.role === 'supermarket_owner' || user?.role === 'shift_manager';

  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [deleteShift, setDeleteShift] = useState<Shift | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ shift: Shift, date: Date, assignments: any[] } | null>(null);
  
  const [registerDate, setRegisterDate] = useState<string>('');

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const fetchAssignments = useCallback(async () => {
    try {
      const sDate = format(weekDays[0], 'yyyy-MM-dd');
      const eDate = format(weekDays[6], 'yyyy-MM-dd');
      const { data } = await axiosInstance.get('/shift-assignments', { params: { startDate: sDate, endDate: eDate, limit: 1000 } });
      setAssignments(data.data || []);
      
      // Update selected cell if it's open
      setSelectedCell(prev => {
        if (!prev) return null;
        const updated = (data.data || []).filter((a: any) => 
          new Date(a.date).toLocaleDateString() === prev.date.toLocaleDateString() && 
          a.shift?._id === prev.shift._id
        );
        return { ...prev, assignments: updated };
      });
    } catch {}
  }, [currentWeekStart]);

  React.useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleSaved = useCallback((saved: Shift) => {
    setShifts(prev => {
      const idx = prev.findIndex(s => s._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setShifts(prev => prev.filter(s => s._id !== id));
  }, []);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <PageHeader
        title="Quản lý Ca làm việc"
        actions={
          isManager && (
            <button onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-transform active:scale-95">
              <Plus className="w-5 h-5" /> Thêm ca mới
            </button>
          )
        }
      />

      {isManager && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" /> Ngày mở đăng ký ca cho tuần sau
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Nhân viên chỉ có thể vào chọn ca cho tuần tiếp theo vào đúng ngày bạn cấu hình dưới đây.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={registerDate} 
              onChange={e => setRegisterDate(e.target.value)}
              className="border border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <button onClick={async () => {
              try {
                await axiosInstance.put('/settings', { shiftRegistrationDate: registerDate });
                alert('Đã lưu ngày đăng ký ca làm việc!');
              } catch(e: any) { alert(e?.response?.data?.message || 'Lỗi khi lưu cài đặt'); }
            }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
              Lưu ngày
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left: Shift list */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> Danh mục Ca làm việc
            </h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">{shifts.length} Ca</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {shifts.length === 0 && (
              <div className="text-center text-gray-400 py-10">
                <Clock className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">Chưa có ca làm việc nào</p>
              </div>
            )}
            {shifts.map(shift => (
              <div key={shift._id} className="border border-gray-100 p-4 rounded-2xl hover:shadow-md transition-shadow bg-white group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-extrabold text-gray-900 text-lg">{shift.name}</h3>
                  {isManager && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditShift(shift)}
                        title="Chỉnh sửa"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      {user?.role === 'supermarket_owner' && (
                        <button
                          onClick={() => setDeleteShift(shift)}
                          title="Xóa"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-4 font-medium">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {shift.startTime} - {shift.endTime}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                    <Users className="w-4 h-4" /> Số lượng tối đa:
                  </div>
                  <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-lg">{shift.maxEmployees} NV</span>
                </div>
                {shift.description && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-1">{shift.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Week grid */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" /> Lịch phân công theo tuần
            </h2>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-gray-700 min-w-[180px] text-center">
                {format(weekDays[0], 'dd/MM')} - {format(weekDays[6], 'dd/MM/yyyy')}
              </span>
              <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-50/30 p-4">
            <div className="min-w-[800px] border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                <div className="p-4 font-bold text-gray-500 text-center border-r border-gray-200">Ca \ Ngày</div>
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="p-3 text-center border-r border-gray-200 last:border-0">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{format(day, 'EEEE', { locale: vi })}</p>
                    <p className={`text-lg font-extrabold ${format(day, 'dd/MM/yyyy') === format(new Date(), 'dd/MM/yyyy') ? 'text-blue-600' : 'text-gray-900'}`}>
                      {format(day, 'dd/MM')}
                    </p>
                  </div>
                ))}
              </div>

              {shifts.map((shift, i) => (
                <div key={shift._id} className={`grid grid-cols-8 ${i !== shifts.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="p-4 border-r border-gray-200 flex flex-col justify-center items-center bg-gray-50/50">
                    <span className="font-bold text-gray-900 text-center">{shift.name}</span>
                    <span className="text-xs font-semibold text-gray-500 mt-1">{shift.startTime}-{shift.endTime}</span>
                  </div>
                  {weekDays.map(day => {
                    const cellAssignments = assignments.filter(a => 
                      new Date(a.date).toLocaleDateString() === day.toLocaleDateString() && 
                      a.shift?._id === shift._id
                    );
                    const approved = cellAssignments.filter(a => a.status === 'approved');
                    const pending = cellAssignments.filter(a => a.status === 'pending');
                    const isFull = approved.length >= shift.maxEmployees;

                    return (
                      <div key={day.toISOString()}
                        onClick={() => setSelectedCell({ shift, date: day, assignments: cellAssignments })}
                        className={`p-2 border-r border-gray-100 last:border-0 min-h-[100px] hover:bg-gray-50 cursor-pointer transition-colors flex flex-col relative group ${
                          isFull ? 'bg-green-50/20' : pending.length > 0 ? 'bg-yellow-50/30' : 'bg-red-50/10'
                        }`}>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-[1px] z-10">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1 shadow-sm">
                            <Plus className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-blue-600">Mở phân công</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col gap-1 group-hover:opacity-0 transition-opacity">
                          {approved.length > 0 && (
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded w-full text-[10px] font-bold">
                              <Check className="w-3 h-3" /> Duyệt: {approved.length}
                            </div>
                          )}
                          {pending.length > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded w-full text-[10px] font-bold animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Chờ: {pending.length}
                            </div>
                          )}
                          {approved.length === 0 && pending.length === 0 && (
                            <div className="text-[10px] text-gray-400 italic text-center mt-2">Chưa có data</div>
                          )}
                        </div>

                        {/* Bottom Status */}
                        <div className="mt-auto self-end group-hover:opacity-0 transition-opacity">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${isFull ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                            {isFull ? 'Đủ NV' : `Trống ${shift.maxEmployees - approved.length}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ShiftFormModal onClose={() => setShowCreateModal(false)} onSaved={handleSaved} />
      )}
      {editShift && (
        <ShiftFormModal shift={editShift} onClose={() => setEditShift(null)} onSaved={handleSaved} />
      )}
      {deleteShift && (
        <ConfirmDeleteModal shift={deleteShift} onClose={() => setDeleteShift(null)} onDeleted={handleDeleted} />
      )}
      {selectedCell && (
        <AssignmentModal 
          shift={selectedCell.shift} 
          date={selectedCell.date} 
          assignments={selectedCell.assignments} 
          onClose={() => setSelectedCell(null)} 
          onUpdateStatus={async (id, status) => {
            try {
              await axiosInstance.patch(`/shift-assignments/${id}/status`, { status });
              fetchAssignments();
            } catch (e: any) { alert(e?.response?.data?.message || 'Lỗi cập nhật'); }
          }}
          onAssign={async (empId) => {
            try {
              await axiosInstance.post('/shift-assignments', { shiftId: selectedCell.shift._id, employeeId: empId, date: selectedCell.date.toISOString(), status: 'approved' });
              fetchAssignments();
            } catch (e: any) { alert(e?.response?.data?.message || 'Lỗi xếp ca'); }
          }}
        />
      )}
    </div>
  );
}
