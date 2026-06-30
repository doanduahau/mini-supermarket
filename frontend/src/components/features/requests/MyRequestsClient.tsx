'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import axiosInstance from '@/lib/axios';
import { Loader2, Plus, Calendar, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyRequestsClient() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [form, setForm] = useState({ shiftAssignmentId: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/leave-requests');
      setRequests(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const todayDate = new Date();
      const currentMonth = todayDate.getMonth() + 1;
      const currentYear = todayDate.getFullYear();
      
      const nextDate = new Date(todayDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      const nextMonth = nextDate.getMonth() + 1;
      const nextYear = nextDate.getFullYear();

      const [res1, res2] = await Promise.all([
        axiosInstance.get(`/my/schedule?month=${currentMonth}&year=${currentYear}`),
        axiosInstance.get(`/my/schedule?month=${nextMonth}&year=${nextYear}`)
      ]);

      const scheduleGroups = [...res1.data.data, ...res2.data.data];
      let allAssignments: any[] = [];
      scheduleGroups.forEach((g: any) => {
        allAssignments = [...allAssignments, ...g.assignments];
      });

      // Lọc trùng lặp phòng trường hợp API trả về ca ở biên bị trùng
      const uniqueAssignments = Array.from(new Map(allAssignments.map(a => [a.id || a._id, a])).values());

      const valid = uniqueAssignments.filter((a: any) => {
        if (a.status !== 'approved') return false;
        const d = new Date(a.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        return d >= today;
      });
      setAssignments(valid);
    } catch (e) {
      console.error('Failed to load assignments', e);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAssignments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shiftAssignmentId || !form.reason) {
      return toast.error('Vui lòng điền đủ thông tin');
    }
    setSubmitting(true);
    try {
      await axiosInstance.post('/leave-requests', form);
      toast.success('Gửi đơn xin nghỉ thành công');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-semibold">Đã duyệt</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-semibold">Từ chối</span>;
      default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-lg font-semibold">Chờ duyệt</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Đơn Xin Nghỉ Ca" description="Quản lý lịch sử và tạo đơn xin nghỉ ca mới." />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Tạo đơn mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl text-center border border-gray-100 text-gray-500">
          Chưa có đơn xin nghỉ ca nào.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Ca làm việc (Ngày)</th>
                <th className="px-6 py-4">Lý do</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Phản hồi của QL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((r: any) => (
                <tr key={r._id || r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {r.shiftAssignment?.shift ? (
                      <div>
                        <div className="font-semibold text-gray-900">{r.shiftAssignment.shift.name}</div>
                        <div className="text-gray-500 text-xs">{r.shiftAssignment.date} ({r.shiftAssignment.shift.startTime} - {r.shiftAssignment.shift.endTime})</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Không tìm thấy ca</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{r.reason}</td>
                  <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{r.managerNote || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">Tạo Đơn Xin Nghỉ Ca</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Chọn ca làm việc sắp tới</label>
                {assignments.length === 0 ? (
                  <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-xl flex items-center gap-2 border border-yellow-100">
                    <AlertCircle className="w-5 h-5" />
                    Bạn không có ca làm việc nào sắp tới để xin nghỉ.
                  </div>
                ) : (
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    value={form.shiftAssignmentId}
                    onChange={(e) => setForm({ ...form, shiftAssignmentId: e.target.value })}
                  >
                    <option value="">-- Chọn ca --</option>
                    {assignments.map(a => (
                      <option key={a.id || a._id} value={a.id || a._id}>
                        {a.date} - {a.shift?.name} ({a.shift?.startTime} - {a.shift?.endTime})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lý do xin nghỉ</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  rows={3}
                  placeholder="Nhập lý do chính đáng..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || assignments.length === 0}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
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
