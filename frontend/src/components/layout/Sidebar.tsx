'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  Wallet,
  Gift,
  BarChart3,
  CalendarDays,
  Clock,
  Banknote,
  LogOut,
} from 'lucide-react';
import { ROLE_LABELS } from '@/lib/constants';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['supermarket_owner', 'shift_manager', 'employee'] },
  
  { label: 'Nhân viên', href: '/employees', icon: Users, roles: ['supermarket_owner', 'shift_manager'] },
  { label: 'Ca làm việc', href: '/shifts', icon: Calendar, roles: ['supermarket_owner', 'shift_manager'] },
  { label: 'Chấm công', href: '/attendance', icon: ClipboardCheck, roles: ['supermarket_owner', 'shift_manager'] },
  
  { label: 'Tính lương', href: '/salary', icon: Wallet, roles: ['supermarket_owner'] },
  { label: 'Thưởng / Phạt', href: '/bonus', icon: Gift, roles: ['supermarket_owner'] },
  { label: 'Báo cáo', href: '/reports', icon: BarChart3, roles: ['supermarket_owner'] },
  
  { label: 'Lịch của tôi', href: '/my/schedule', icon: CalendarDays, roles: ['employee'] },
  { label: 'Chấm công của tôi', href: '/my/attendance', icon: Clock, roles: ['employee'] },
  { label: 'Thu nhập', href: '/my/salary', icon: Banknote, roles: ['employee'] },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const allowedMenus = MENU_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-transform duration-300 shadow-xl md:shadow-none ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 w-72 md:w-20 lg:w-64'}`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-100 px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-extrabold italic shadow-md">
              M
            </div>
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 md:hidden lg:block whitespace-nowrap overflow-hidden">
              Mini HR
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 custom-scrollbar">
          {allowedMenus.map((item) => {
            const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-[22px] h-[22px] flex-shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="md:hidden lg:block whitespace-nowrap overflow-hidden">
                  {item.label}
                </span>
                
                {/* Tooltip for tablet state */}
                <div className="hidden md:block lg:hidden absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold flex-shrink-0 shadow-sm">
              {user.fullName.charAt(0)}
            </div>
            <div className="md:hidden lg:block overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <p className="text-xs font-medium text-gray-500 truncate">{ROLE_LABELS[user.role]}</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors group relative font-medium"
          >
            <LogOut className="w-[22px] h-[22px] flex-shrink-0 text-red-400 group-hover:text-red-600 transition-colors" />
            <span className="md:hidden lg:block whitespace-nowrap overflow-hidden">Đăng xuất</span>
            <div className="hidden md:block lg:hidden absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap shadow-xl">
              Đăng xuất
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
