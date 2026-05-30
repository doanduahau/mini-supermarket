'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/layout/PageHeader';
import { Plus, Search, MoreVertical, Edit, Lock, Unlock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import EmployeeFormModal from './EmployeeFormModal';
import axiosInstance from '@/lib/axios';
import { formatDate } from '@/lib/utils';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function EmployeeListClient({ initialData, meta, searchParams }: any) {
  const router = useRouter();
  const searchP = useSearchParams();
  const { user } = useAuth();
  
  const [search, setSearch] = useState(searchP.get('search') || '');
  const [role, setRole] = useState(searchP.get('role') || '');
  const [status, setStatus] = useState(searchP.get('status') || '');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const isCST = user?.role === 'supermarket_owner';

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchP.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set('page', '1');
    router.push(`/employees?${params.toString()}`);
  };

  const toggleStatus = async (emp: any) => {
    try {
      await axiosInstance.patch(`/users/${emp._id}/status`, { status: emp.status === 'active' ? 'locked' : 'active' });
      router.refresh();
    } catch (e) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <>
      <PageHeader 
        title="Quản lý nhân viên" 
        actions={
          isCST && (
            <button onClick={() => { setEditEmployee(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 transition-transform active:scale-95 shadow-sm">
              <Plus className="w-5 h-5" /> Thêm nhân viên
            </button>
          )
        }
      />

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm họ tên, email..." 
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateFilters({ search })}
          />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); updateFilters({ role: e.target.value }); }} className="w-full md:w-auto border border-gray-200 hover:border-gray-300 py-2.5 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white sm:text-sm font-medium text-gray-700 cursor-pointer transition-colors">
          <option value="">Tất cả vai trò</option>
          <option value="supermarket_owner">Chủ siêu thị</option>
          <option value="shift_manager">Quản lý ca</option>
          <option value="employee">Nhân viên</option>
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); updateFilters({ status: e.target.value }); }} className="w-full md:w-auto border border-gray-200 hover:border-gray-300 py-2.5 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white sm:text-sm font-medium text-gray-700 cursor-pointer transition-colors">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Ngày vào làm</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialData?.map((emp: any) => (
                <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold shrink-0 border border-blue-200">
                      {emp.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{emp.fullName}</p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{emp.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={emp.role === 'supermarket_owner' ? 'purple' : emp.role === 'shift_manager' ? 'blue' : 'gray'}>
                      {emp.role === 'supermarket_owner' ? 'Chủ ST' : emp.role === 'shift_manager' ? 'Quản lý' : 'Nhân viên'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium">{emp.phone || '-'}</td>
                  <td className="px-6 py-4">{formatDate(emp.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Badge color={emp.status === 'active' ? 'green' : 'red'}>
                      {emp.status === 'active' ? 'Đang HĐ' : 'Đã khóa'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 rounded-xl p-1.5 min-w-[180px] z-50 animate-in fade-in zoom-in-95 duration-200" sideOffset={5} align="end">
                          <DropdownMenu.Item className="outline-none" asChild>
                            <Link href={`/employees/${emp._id}`} className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                              <Eye className="w-4 h-4 text-gray-400" /> Xem chi tiết
                            </Link>
                          </DropdownMenu.Item>
                          {isCST && (
                            <>
                              <DropdownMenu.Item onClick={() => { setEditEmployee(emp); setIsModalOpen(true); }} className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer outline-none transition-colors">
                                <Edit className="w-4 h-4 text-gray-400" /> Chỉnh sửa
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="h-[1px] bg-gray-100 my-1" />
                              <DropdownMenu.Item onClick={() => toggleStatus(emp)} className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer outline-none transition-colors">
                                {emp.status === 'active' ? <><Lock className="w-4 h-4"/> Khóa tài khoản</> : <><Unlock className="w-4 h-4"/> Mở khóa TK</>}
                              </DropdownMenu.Item>
                            </>
                          )}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </td>
                </tr>
              ))}
              {(!initialData || initialData.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium text-base">Không tìm thấy nhân viên nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-sm font-medium text-gray-500">Hiển thị trang {meta.page} / {meta.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={meta.page <= 1} onClick={() => updateFilters({ page: String(meta.page - 1) })} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-white bg-gray-50 hover:shadow-sm transition-all active:scale-95">Trước</button>
              <button disabled={meta.page >= meta.totalPages} onClick={() => updateFilters({ page: String(meta.page + 1) })} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-white bg-gray-50 hover:shadow-sm transition-all active:scale-95">Sau</button>
            </div>
          </div>
        )}
      </div>

      <EmployeeFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        employee={editEmployee} 
        onSuccess={() => { setIsModalOpen(false); router.refresh(); }} 
      />
    </>
  );
}
