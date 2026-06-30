'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import axiosInstance from '@/lib/axios';
import { Loader2, Plus, ArrowRightLeft, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

export default function MySwapsClient() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [otherAssignments, setOtherAssignments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [form, setForm] = useState({ receiverId: '', sourceAssignmentId: '', targetAssignmentId: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/shift-swaps');
      setRequests(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi tải danh sách đổi ca');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const todayDate = new Date();
      const currentMonth = todayDate.getMonth() + 1;
      const currentYear = todayDate.getFullYear();
      
      const nextDate = new Date(todayDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      const nextMonth = nextDate.getMonth() + 1;
      const nextYear = nextDate.getFullYear();

      const [myRes1, myRes2, usersRes] = await Promise.all([
        axiosInstance.get(`/my/schedule?month=${currentMonth}&year=${currentYear}`),
        axiosInstance.get(`/my/schedule?month=${nextMonth}&year=${nextYear}`),
        axiosInstance.get('/my/coworkers')
      ]);

      const scheduleGroups = [...myRes1.data.data, ...myRes2.data.data];
      let allAssignments: any[] = [];
      scheduleGroups.forEach((g: any) => {
        allAssignments = [...allAssignments, ...g.assignments];
      });

      const uniqueAssignments = Array.from(new Map(allAssignments.map(a => [a.id || a._id, a])).values());

      const validMine = uniqueAssignments.filter((a: any) => {
        if (a.status !== 'approved') return false;
        const d = new Date(a.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        return d >= today;
      });
      setMyAssignments(validMine);
      setUsers(usersRes.data.data.filter((u: any) => (u._id || u.id) !== (user?._id || user?.id)));
    } catch (e) {
      console.error('Lỗi tải dữ liệu ca làm việc', e);
    }
  };

  const fetchOtherAssignments = async (receiverId: string) => {
    if (!receiverId) return setOtherAssignments([]);
    try {
      // Gọi API lấy lịch của đồng nghiệp
      const res = await axiosInstance.get(`/my/coworker-shifts/${receiverId}`);
      const validOther = res.data.data.filter((a: any) => {
        const d = new Date(a.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        return d >= today;
      });
      setOtherAssignments(validOther);
    } catch (e) {
      console.error('Lỗi tải ca người nhận', e);
      toast.error('Không thể lấy lịch của nhân viên này');
    }
  };

  useEffect(() => {
    fetchData();
    fetchDropdownData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sourceAssignmentId || !form.receiverId || !form.reason) {
      return toast.error('Vui lòng điền đủ thông tin');
    }
    setSubmitting(true);
    try {
      await axiosInstance.post('/shift-swaps', form);
      toast.success('Gửi yêu cầu đổi ca thành công');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (id: number, status: 'pending_manager' | 'rejected') => {
    try {
      await axiosInstance.patch(`/shift-swaps/${id}/status`, { status, note: status === 'pending_manager' ? 'Tôi đồng ý đổi' : 'Tôi từ chối đổi' });
      toast.success(status === 'pending_manager' ? 'Đã đồng ý, chờ quản lý duyệt' : 'Đã từ chối');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi phản hồi');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_receiver': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-lg font-semibold">Chờ đồng nghiệp</span>;
      case 'pending_manager': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-semibold">Chờ QL duyệt</span>;
      case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-semibold">Thành công</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-semibold">Bị từ chối</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Đổi Ca Làm Việc" description="Đổi ca hoặc nhường ca cho đồng nghiệp." />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all font-semibold"
        >
          <ArrowRightLeft className="w-5 h-5" />
          Yêu cầu đổi ca
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl text-center border border-gray-100 text-gray-500">
          Chưa có yêu cầu đổi ca nào.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((r: any) => {
            const isRequester = r.requesterId === (user?._id || user?.id);
            const isPendingMe = !isRequester && r.status === 'pending_receiver';
            
            return (
              <div key={r.id || r._id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(r.status)}
                    {isRequester ? (
                      <span className="text-xs text-gray-500">Bạn là người gửi</span>
                    ) : (
                      <span className="text-xs text-indigo-500 font-medium">Bạn là người nhận</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-xl">
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 mb-1">{r.requester?.fullName}</div>
                    <div className="font-semibold text-gray-900">{r.sourceAssignment?.shift?.name}</div>
                    <div className="text-xs text-gray-600">{r.sourceAssignment?.date}</div>
                  </div>
                  <ArrowRightLeft className="w-5 h-5 text-gray-400 mx-2" />
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 mb-1">{r.receiver?.fullName}</div>
                    {r.targetAssignment ? (
                      <>
                        <div className="font-semibold text-gray-900">{r.targetAssignment.shift?.name}</div>
                        <div className="text-xs text-gray-600">{r.targetAssignment.date}</div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 mt-2 italic">Không nhận lại ca</div>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-700 mb-4 bg-yellow-50/50 p-3 rounded-xl border border-yellow-100">
                  <span className="font-semibold">Lý do:</span> {r.reason}
                </div>

                {isPendingMe && (
                  <div className="flex gap-2">
                    <button onClick={() => handleRespond(r.id || r._id, 'pending_manager')} className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex justify-center items-center gap-1 transition-colors text-sm">
                      <Check className="w-4 h-4" /> Đồng ý đổi
                    </button>
                    <button onClick={() => handleRespond(r.id || r._id, 'rejected')} className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-semibold flex justify-center items-center gap-1 transition-colors text-sm">
                      <X className="w-4 h-4" /> Từ chối
                    </button>
                  </div>
                )}
                
                {r.managerNote && (
                  <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <span className="font-semibold text-gray-700">QL nhắn:</span> {r.managerNote || r.reviewNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">Yêu Cầu Đổi Ca</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ca của bạn muốn đổi</label>
                <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  value={form.sourceAssignmentId} onChange={(e) => setForm({ ...form, sourceAssignmentId: e.target.value })}>
                  <option value="">-- Chọn ca của bạn --</option>
                  {myAssignments.map(a => (
                    <option key={a.id || a._id} value={a.id || a._id}>
                      {a.date} - {a.shift?.name} ({a.shift?.startTime} - {a.shift?.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Người bạn muốn đổi cùng</label>
                <select required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 transition-all outline-none"
                  value={form.receiverId} 
                  onChange={(e) => {
                    setForm({ ...form, receiverId: e.target.value, targetAssignmentId: '' });
                    fetchOtherAssignments(e.target.value);
                  }}>
                  <option value="">-- Chọn nhân viên --</option>
                  {users.map(u => (
                    <option key={u.id || u._id} value={u.id || u._id}>{u.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ca của họ bạn sẽ làm thay (Tùy chọn)</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 transition-all outline-none"
                  value={form.targetAssignmentId} onChange={(e) => setForm({ ...form, targetAssignmentId: e.target.value })}>
                  <option value="">-- Không nhận lại ca (Chỉ nhường ca) --</option>
                  {otherAssignments.map(a => (
                    <option key={a.id || a._id} value={a.id || a._id}>
                      {a.date} - {a.shift?.name} ({a.shift?.startTime} - {a.shift?.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lý do</label>
                <textarea required rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                  value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200">Hủy</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi Yêu Cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
