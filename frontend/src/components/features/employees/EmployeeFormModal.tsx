'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import axiosInstance from '@/lib/axios';
import { Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  fullName: z.string().min(2, 'Nhập họ tên đầy đủ'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().optional(),
  role: z.enum(['supermarket_owner', 'shift_manager', 'employee']),
  phone: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EmployeeFormModal({ isOpen, onClose, employee, onSuccess }: any) {
  const isEdit = !!employee;
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'employee' }
  });

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (isEdit) {
        reset({ 
          fullName: employee.fullName, 
          email: employee.email, 
          role: employee.role, 
          phone: employee.phone || '', 
          password: '',
          bankAccount: employee.bankAccount || '',
          bankName: employee.bankName || ''
        });
      } else {
        reset({ 
          fullName: '', 
          email: '', 
          role: 'employee', 
          phone: '', 
          password: '',
          bankAccount: '',
          bankName: ''
        });
      }
    }
  }, [isOpen, isEdit, employee, reset]);

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      if (!isEdit && !data.password) {
        setError('Vui lòng nhập mật khẩu cho nhân viên mới');
        return;
      }
      
      const payload = { ...data };
      if (isEdit && !payload.password) {
        delete payload.password;
      }

      if (isEdit) {
        await axiosInstance.put(`/users/${employee._id}`, payload);
      } else {
        await axiosInstance.post('/users', payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Sửa hồ sơ nhân viên' : 'Thêm nhân viên mới'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 font-medium">{error}</div>}
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
          <input {...register('fullName')} className="w-full px-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" placeholder="VD: Nguyễn Văn A" />
          {errors.fullName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email liên hệ <span className="text-red-500">*</span></label>
          <input type="email" {...register('email')} autoComplete="off" className="w-full px-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" />
          {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu {isEdit ? '(Bỏ trống nếu không đổi)' : <span className="text-red-500">*</span>}</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} {...register('password')} autoComplete="new-password" className="w-full px-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm pr-10" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phân quyền (Vai trò) <span className="text-red-500">*</span></label>
            <select {...register('role')} className="w-full px-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm cursor-pointer bg-white">
              <option value="supermarket_owner">Chủ siêu thị</option>
              <option value="shift_manager">Quản lý ca</option>
              <option value="employee">Nhân viên</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
            <input {...register('phone')} className="w-full px-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" placeholder="09xxxx..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngân hàng</label>
            <input {...register('bankName')} className="w-full px-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" placeholder="VD: Vietcombank, Techcombank..." />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tài khoản</label>
            <input {...register('bankAccount')} className="w-full px-4 py-2.5 border border-gray-200 hover:border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm" placeholder="VD: 1903..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-bold transition-colors active:scale-95">Hủy</button>
          <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all disabled:bg-blue-400 active:scale-95 shadow-sm">
            {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
