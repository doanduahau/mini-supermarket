'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { Loader2, AlertCircle, X, ChevronRight } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/constants';

interface ConfigItem {
  _id: string;
  role: string;
  hourlyRate: number;
  effectiveFrom: string;
}

export default function SalaryConfigModal({ onClose }: { onClose: () => void }) {
  const [configs, setConfigs] = useState<Record<string, { current: ConfigItem | null, history: ConfigItem[] }>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    role: 'employee',
    hourlyRate: '',
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/salary-config');
      setConfigs(data.data || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hourlyRate) return alert('Vui lòng nhập đơn giá');
    setUpdating(true);
    try {
      await axiosInstance.post('/salary-config', { ...form, hourlyRate: Number(form.hourlyRate) });
      alert('Cập nhật thành công!');
      fetchData();
      setForm({ ...form, hourlyRate: '' }); // reset input
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-xl text-gray-900">Cấu hình Đơn giá Lương</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Current Configs */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Mức lương hiện tại</h3>
            {loading ? (
              <div className="text-center p-4 text-gray-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['shift_manager', 'employee'].map(role => (
                  <div key={role} className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <p className="text-sm font-semibold text-gray-500 mb-1">{ROLE_LABELS[role as keyof typeof ROLE_LABELS]}</p>
                    <p className="text-2xl font-extrabold text-blue-600">
                      {configs[role]?.current?.hourlyRate 
                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(configs[role].current.hourlyRate) + '/h'
                        : 'Chưa thiết lập'}
                    </p>
                    {configs[role]?.current?.effectiveFrom && (
                      <p className="text-xs text-gray-400 mt-2">
                        Áp dụng từ: {new Date(configs[role].current.effectiveFrom).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4">Thay đổi mức lương</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Vai trò (Role)</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="shift_manager">Quản lý ca</option>
                    <option value="employee">Nhân viên</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Đơn giá mới (VNĐ/h)</label>
                  <input type="number" value={form.hourlyRate} onChange={e => setForm({...form, hourlyRate: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white" 
                    placeholder="VD: 30000" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Ngày áp dụng</label>
                  <input type="date" value={form.effectiveFrom} onChange={e => setForm({...form, effectiveFrom: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
              </div>
              <button disabled={updating}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu mức lương mới'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
