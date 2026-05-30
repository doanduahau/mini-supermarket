'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, ChevronRight, User as UserIcon, Key, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

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

export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const paths = pathname.split('/').filter(p => p);
  
  const breadcrumbs = paths.map((path, index) => {
    const isLast = index === paths.length - 1;
    // Fallback heuristic cho detail id (24 kí tự mongo id)
    const label = ROUTE_NAMES[path] || (path.length === 24 ? 'Chi tiết' : path);
    return { label, isLast };
  });

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
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

              <DropdownMenu.Item className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg outline-none hover:bg-gray-100 focus:bg-gray-100 cursor-pointer transition-colors">
                <UserIcon className="w-4 h-4 text-gray-400" />
                Thông tin tài khoản
              </DropdownMenu.Item>
              <DropdownMenu.Item className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg outline-none hover:bg-gray-100 focus:bg-gray-100 cursor-pointer transition-colors">
                <Key className="w-4 h-4 text-gray-400" />
                Đổi mật khẩu
              </DropdownMenu.Item>
              
              <DropdownMenu.Separator className="h-[1px] bg-gray-100 my-1.5" />
              
              <DropdownMenu.Item 
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg outline-none hover:bg-red-50 focus:bg-red-50 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Đăng xuất
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
