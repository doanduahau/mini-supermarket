'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import axiosInstance from '@/lib/axios';
import { Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerRequestsClient() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (id: number, status: 'approved' | 'rejected') => {
    const note = prompt(`Nhập ghi chú cho quyết định ${status === 'approved' ? 'DUYỆT' : 'TỪ CHỐI'} này (Tùy chọn):`);
    if (note === null) return;

    try {
      await axiosInstance.patch(`/leave-requests/${id}/status`, { status, managerNote: note });
      toast.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} đơn`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
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
      <PageHeader title="Duyệt Đơn Xin Nghỉ Ca" description="Quản lý và xét duyệt các đơn xin phép của nhân viên." />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl text-center border border-gray-100 text-gray-500">
          Chưa có đơn xin nghỉ ca nào trong hệ thống.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Ca làm việc</th>
                <th className="px-6 py-4">Lý do</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((r: any) => (
                <tr key={r._id || r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{r.employee?.fullName}</div>
                    <div className="text-gray-500 text-xs">{r.employee?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {r.shiftAssignment?.shift ? (
                      <div>
                        <div className="font-semibold text-gray-900">{r.shiftAssignment.shift.name}</div>
                        <div className="text-gray-500 text-xs">{r.shiftAssignment.date}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Ca đã bị xóa</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700 max-w-[200px] truncate" title={r.reason}>{r.reason}</td>
                  <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {r.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdate(r.id, 'approved')} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl" title="Duyệt">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleUpdate(r.id, 'rejected')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl" title="Từ chối">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">{r.manager?.fullName || 'Hệ thống'} đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
