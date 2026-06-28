'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Gift, AlertTriangle, Wallet } from 'lucide-react';
import BonusFormModal from './BonusFormModal';

export default function BonusClient({ initialData, summary, searchParams }: any) {
  const router = useRouter();
  const searchP = useSearchParams();
  
  const date = new Date();
  const [month, setMonth] = useState(searchP.get('month') || String(date.getMonth() + 1));
  const [year, setYear] = useState(searchP.get('year') || String(date.getFullYear()));
  const [type, setType] = useState(searchP.get('type') || '');
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateFilters = () => {
    const params = new URLSearchParams(searchP.toString());
    if (month) params.set('month', month);
    if (year) params.set('year', year);
    if (type) params.set('type', type); else params.delete('type');
    router.push(`/bonus?${params.toString()}`);
  };

  return (
    <>
      <PageHeader 
        title="Thưởng & Phạt" 
        actions={
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-transform active:scale-95">
            <Plus className="w-5 h-5" /> Thêm mới
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">TỔNG THƯỞNG</p>
            <h3 className="text-3xl font-extrabold text-green-600">{formatCurrency(summary.bonusTotal || 0)}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Gift className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">TỔNG PHẠT</p>
            <h3 className="text-3xl font-extrabold text-red-600">{formatCurrency(summary.penaltyTotal || 0)}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">NET THÁNG NÀY</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{formatCurrency(summary.netTotal || 0)}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full sm:w-auto border border-gray-200 py-2.5 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white sm:text-sm font-medium text-gray-700">
          {Array.from({length: 12}).map((_, i) => (
            <option key={i+1} value={i+1}>Tháng {i+1}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full sm:w-auto border border-gray-200 py-2.5 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white sm:text-sm font-medium text-gray-700">
          <option value="2024">Năm 2024</option>
          <option value="2025">Năm 2025</option>
          <option value="2026">Năm 2026</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full sm:w-auto border border-gray-200 py-2.5 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white sm:text-sm font-medium text-gray-700">
          <option value="">Tất cả loại</option>
          <option value="bonus">Thưởng</option>
          <option value="penalty">Phạt</option>
        </select>
        <button onClick={updateFilters} className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-6 rounded-xl transition-colors">
          Lọc dữ liệu
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Kỳ áp dụng</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4 text-right">Số tiền</th>
                <th className="px-6 py-4 w-1/3">Lý do</th>
                <th className="px-6 py-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialData.map((item: any) => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{item.employee.fullName}</td>
                  <td className="px-6 py-4 font-medium">{item.month}/{item.year}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.type === 'bonus' ? 'success' : 'error'}>
                      {item.type === 'bonus' ? 'Thưởng' : 'Phạt'}
                    </Badge>
                  </td>
                  <td className={`px-6 py-4 font-extrabold text-right ${item.type === 'bonus' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'bonus' ? '+' : '-'}{formatCurrency(item.amount)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.reason}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
              {initialData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Không có khoản thưởng/phạt nào trong kỳ này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && <BonusFormModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
