'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import Link from 'next/link';

export default function NotificationBell({ userId }: { userId: string }) {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const prevCount = useRef(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 1000);
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    if (diff < 1) return 'Vừa xong';
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return `${Math.floor(diff / 1440)} ngày trước`;
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
      >
        <Bell className={`w-6 h-6 ${isRinging ? 'animate-[wiggle_0.3s_ease-in-out_2]' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Không có thông báo mới</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => markRead(notif.id)}
                    className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${notif.read ? 'opacity-70' : 'bg-blue-50/30'}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                        {notif.link ? (
                          <Link href={notif.link} className="hover:underline" onClick={() => setIsOpen(false)}>
                            {notif.message}
                          </Link>
                        ) : (
                          notif.message
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
      `}} />
    </div>
  );
}
