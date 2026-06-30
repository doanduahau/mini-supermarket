'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import axiosInstance from '@/lib/axios';
import { Loader2, ArrowRightLeft, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManagerSwapsClient() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = async (id: number, status: 'approved' | 'rejected') => {
    const note = prompt(`Nhập ghi chú cho quyết định ${status === 'approved' ? 'DUYỆT' : 'TỪ CHỐI'} đổi ca (Tùy chọn):`);
    if (note === null) return;

    try {
      await axiosInstance.patch(`/shift-swaps/${id}/status`, { status, note });
      toast.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} đổi ca`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_receiver': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-lg font-semibold">Chờ NV xác nhận</span>;
      case 'pending_manager': return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-semibold">Chờ QL duyệt</span>;
      case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-semibold">Đã duyệt</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-semibold">Từ chối</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Duyệt Đơn Đổi Ca" description="Quản lý và xét duyệt các yêu cầu đổi ca/nhường ca của nhân viên." />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl text-center border border-gray-100 text-gray-500">
          Chưa có yêu cầu đổi ca nào trong hệ thống.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Người xin đổi</th>
                <th className="px-6 py-4"></th>
                <th className="px-6 py-4">Người nhận</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((r: any) => (
                <tr key={r.id || r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{r.requester?.fullName}</div>
                    <div className="text-gray-500 text-xs mt-1">
                      {r.sourceAssignment?.shift?.name} ({r.sourceAssignment?.date})
                    </div>
                  </td>
                  <td className="px-2 py-4 text-center">
                    <ArrowRightLeft className="w-4 h-4 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{r.receiver?.fullName}</div>
                    {r.targetAssignment ? (
                      <div className="text-gray-500 text-xs mt-1">
                        {r.targetAssignment?.shift?.name} ({r.targetAssignment?.date})
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs mt-1 italic">Chỉ nhường ca</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="mb-1">{getStatusBadge(r.status)}</div>
                    {r.reason && <div className="text-xs text-gray-500 max-w-[150px] truncate" title={r.reason}>Lý do: {r.reason}</div>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.status === 'pending_manager' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdate(r.id, 'approved')} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl" title="Duyệt">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleUpdate(r.id, 'rejected')} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl" title="Từ chối">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {r.status === 'pending_receiver' ? 'Đang chờ NV xác nhận' : 'Đã xử lý'}
                      </span>
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
