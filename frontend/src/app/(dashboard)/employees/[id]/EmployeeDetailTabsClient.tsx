'use client';

import React, { useState, useEffect } from 'react';
import { User, Briefcase, FileText, Loader2, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface EmployeeDetailTabsClientProps {
  employeeId: string;
}

export default function EmployeeDetailTabsClient({ employeeId }: EmployeeDetailTabsClientProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'schedule' | 'attendance'>('general');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'general') return;
    fetchData(activeTab);
  }, [activeTab, employeeId]);

  const fetchData = async (tab: 'schedule' | 'attendance') => {
    setLoading(true);
    try {
      if (tab === 'schedule') {
        // Fetch upcoming shifts for this employee
        const { data: res } = await axiosInstance.get(`/shift-assignments`, {
          params: { employeeId, sort: 'date', limit: 30 } // assuming backend supports this
        });
        setData(res.data);
      } else if (tab === 'attendance') {
        // Fetch attendance history
        const { data: res } = await axiosInstance.get(`/attendance`, {
          params: { employeeId, sort: '-date', limit: 30 } // assuming backend supports this
        });
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge color="green">Đã duyệt</Badge>;
      case 'pending': return <Badge color="yellow">Chờ duyệt</Badge>;
      case 'rejected': return <Badge color="red">Từ chối</Badge>;
      default: return <Badge color="gray">{status}</Badge>;
    }
  };

  const getAttStatus = (status: string) => {
    switch(status) {
      case 'present': return <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Đúng giờ</span>;
      case 'late': return <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Đi muộn</span>;
      case 'absent': return <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/> Vắng mặt</span>;
      default: return <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Chưa vào</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100">
        <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
          <button 
            onClick={() => setActiveTab('general')}
            className={`py-4 px-1 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <User className="w-4 h-4" /> Thông tin chung
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-1 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'schedule' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <Briefcase className="w-4 h-4" /> Lịch làm việc
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`py-4 px-1 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FileText className="w-4 h-4" /> Lịch sử chấm công
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'general' && (
          <div className="text-center text-gray-500 py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Hồ sơ cá nhân</h3>
            <p className="text-sm">Thông tin cá nhân cơ bản đã được hiển thị đầy đủ ở mục trên.</p>
          </div>
        )}

        {activeTab !== 'general' && loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : activeTab === 'schedule' && data ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Ca làm việc</th>
                  <th className="px-4 py-3">Giờ</th>
                  <th className="px-4 py-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.length > 0 ? data.map((item: any) => (
                  <tr key={item._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{formatDate(item.date)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.shift?.name}</td>
                    <td className="px-4 py-3">{item.shift?.startTime} - {item.shift?.endTime}</td>
                    <td className="px-4 py-3 text-right">{getStatusBadge(item.status)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">Không có ca làm việc nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'attendance' && data ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Ca làm việc</th>
                  <th className="px-4 py-3">Giờ vào</th>
                  <th className="px-4 py-3">Giờ ra</th>
                  <th className="px-4 py-3">Số giờ</th>
                  <th className="px-4 py-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.length > 0 ? data.map((item: any) => (
                  <tr key={item._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{formatDate(item.date)}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.shift?.name}</td>
                    <td className="px-4 py-3">{item.checkIn ? new Date(item.checkIn).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
                    <td className="px-4 py-3">{item.checkOut ? new Date(item.checkOut).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
                    <td className="px-4 py-3 font-medium">{item.actualHours ? `${item.actualHours}h` : '—'}</td>
                    <td className="px-4 py-3 flex justify-end">{getAttStatus(item.status)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">Không có dữ liệu chấm công</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
