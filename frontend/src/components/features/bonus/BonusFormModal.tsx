'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BonusFormModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    employee: '',
    type: 'bonus',
    amount: '',
    reason: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    axiosInstance.get('/users?role=employee&limit=100').then(({ data }) => setEmployees(data.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.amount || !form.reason) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/bonuses', { ...form, amount: Number(form.amount) });
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-xl text-gray-900">Thêm Thưởng / Phạt</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2"><AlertCircle className="w-5 h-5"/>{error}</div>}
          
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Nhân viên</label>
            <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">-- Chọn nhân viên --</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.fullName}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Loại</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="bonus">Thưởng (+)</option>
                <option value="penalty">Phạt (-)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Kỳ lương</label>
              <div className="flex gap-2">
                <input type="number" min="1" max="12" value={form.month} onChange={e => setForm({...form, month: Number(e.target.value)})}
                  className="w-1/2 border border-gray-200 rounded-xl px-2 py-2 text-center focus:ring-2 focus:ring-blue-500" />
                <input type="number" value={form.year} onChange={e => setForm({...form, year: Number(e.target.value)})}
                  className="w-1/2 border border-gray-200 rounded-xl px-2 py-2 text-center focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Số tiền (VNĐ)</label>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="VD: 500000" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Lý do</label>
            <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500" placeholder="Thưởng chuyên cần, Đi trễ..." />
          </div>
        </form>
        <div className="p-6 pt-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 text-gray-700">Hủy</button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin"/>} Lưu lại
          </button>
        </div>
      </div>
    </div>
  );
}
