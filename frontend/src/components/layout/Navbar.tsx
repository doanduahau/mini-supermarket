'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, ChevronRight, User as UserIcon, Key, LogOut, X, Loader2, Eye, EyeOff, Phone, Mail, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import NotificationBell from './NotificationBell';
import axiosInstance from '@/lib/axios';
import { ROLE_LABELS } from '@/lib/constants';

const ROUTE_NAMES: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Nhân viên',
  shifts: 'Ca làm việc',
  attendance: 'Chấm công',
  salary: 'Tính lương',
  bonus: 'Thưởng / Phạt',
  reports: 'Báo cáo',
  my: 'Cá nhân',
  schedule: 'Lịch của tôi',
};

// ─── Profile Modal ────────────────────────────────────────────────────────────
function ProfileModal({ onClose, onUpdated }: { onClose: () => void; onUpdated: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', bankAccount: '', bankName: '' });
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch latest profile data from API on mount
  React.useEffect(() => {
    axiosInstance.get('/my/profile')
      .then(({ data }) => {
        const p = data.data;
        setProfile(p);
        setForm({ 
          fullName: p.fullName || '', 
          phone: p.phone || '',
          email: p.email || '',
          bankAccount: p.bankAccount || '',
          bankName: p.bankName || ''
        });
      })
      .catch(() => setError('Không thể tải thông tin tài khoản.'))
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { setError('Họ tên không được để trống.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await axiosInstance.put('/my/profile', form);
      setSuccess('Cập nhật thông tin thành công!');
      onUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-xl text-gray-900">Thông tin tài khoản</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-4">
          {fetching ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* Avatar + role badge */}
              <div className="flex items-center gap-4 bg-blue-50 rounded-2xl p-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-extrabold flex items-center justify-center shadow-lg">
                  {profile?.fullName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-lg">{profile?.fullName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <BadgeCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">{ROLE_LABELS[profile?.role] || profile?.role}</span>
                  </div>
                </div>
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5"><BadgeCheck className="w-3.5 h-3.5" />Vai trò</label>
                  <div className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-600 truncate">{ROLE_LABELS[profile?.role] || profile?.role}</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5"><BadgeCheck className="w-3.5 h-3.5" />Ngày vào làm</label>
                  <div className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-600">
                    {profile?.startDate ? new Date(profile.startDate).toLocaleDateString('vi-VN') : '—'}
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2 px-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${profile?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${profile?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                  {profile?.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
              </div>

              {/* Editable fields */}
              <form onSubmit={handleSave} className="space-y-4 pt-1 border-t border-gray-100">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">{error}</div>}
                {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl">{success}</div>}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5"><UserIcon className="w-3.5 h-3.5" />Họ tên</label>
                    <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5"><Mail className="w-3.5 h-3.5" />Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5"><Phone className="w-3.5 h-3.5" />Số điện thoại</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="VD: 0901234567"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">Ngân hàng</label>
                    <input value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))}
                      placeholder="VD: Vietcombank"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">Số tài khoản</label>
                    <input value={form.bankAccount} onChange={e => setForm(f => ({ ...f, bankAccount: e.target.value }))}
                      placeholder="VD: 1012345678"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose}
                    className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Đóng</button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}Lưu thay đổi
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Vui lòng điền đầy đủ cả 3 ô mật khẩu.'); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.'); return;
    }
    if (form.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      await axiosInstance.patch('/my/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setSuccess('Đổi mật khẩu thành công!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ field, label, showKey, autoCompleteVal }: { 
    field: keyof typeof form; label: string; showKey: keyof typeof show; autoCompleteVal: string 
  }) => (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
          autoComplete={autoCompleteVal}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          placeholder="••••••••"
        />
        <button type="button" onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-xl text-gray-900">Đổi mật khẩu</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 rounded-xl">{success}</div>}

          <PasswordInput field="currentPassword" label="Mật khẩu hiện tại" showKey="current" autoCompleteVal="current-password" />
          <PasswordInput field="newPassword" label="Mật khẩu mới" showKey="new" autoCompleteVal="new-password" />
          <PasswordInput field="confirmPassword" label="Xác nhận mật khẩu mới" showKey="confirm" autoCompleteVal="new-password" />

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Hủy</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const pathname = usePathname();
  const { user, logout, refreshUser } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const paths = pathname.split('/').filter(p => p);
  const breadcrumbs = paths.map((path, index) => {
    const isLast = index === paths.length - 1;
    const label = ROUTE_NAMES[path] || (path.length === 24 ? 'Chi tiết' : path);
    return { label, isLast };
  });

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-all">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Menu className="w-6 h-6" />
          </button>

          <nav className="hidden sm:flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-4 h-4 mx-1.5 flex-shrink-0 text-gray-400" />}
                  <span className={`${crumb.isLast ? 'text-gray-900 font-semibold' : 'hover:text-gray-700 transition-colors'}`}>
                    {crumb.label}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === 'employee' && user._id && (
            <NotificationBell userId={user._id} />
          )}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-full outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold shadow-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[240px] bg-white rounded-xl p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 animate-in fade-in zoom-in-95 duration-200 z-50 mr-4 mt-2"
                sideOffset={5}
              >
                <div className="px-3 py-3 border-b border-gray-100 mb-1.5 bg-gray-50/50 rounded-t-lg">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>

                <DropdownMenu.Item
                  onSelect={() => setShowProfile(true)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg outline-none hover:bg-gray-100 focus:bg-gray-100 cursor-pointer transition-colors">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  Thông tin tài khoản
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onSelect={() => setShowChangePassword(true)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg outline-none hover:bg-gray-100 focus:bg-gray-100 cursor-pointer transition-colors">
                  <Key className="w-4 h-4 text-gray-400" />
                  Đổi mật khẩu
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-[1px] bg-gray-100 my-1.5" />

                <DropdownMenu.Item
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg outline-none hover:bg-red-50 focus:bg-red-50 cursor-pointer transition-colors">
                  <LogOut className="w-4 h-4 text-red-500" />
                  Đăng xuất
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} onUpdated={refreshUser} />
      )}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
}
