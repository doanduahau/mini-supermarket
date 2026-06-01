'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

export default function NotificationBell({ userId }: { userId: string }) {
  const { unreadCount } = useNotifications(userId);
  const [isRinging, setIsRinging] = useState(false);
  const [newAnnouncementCount, setNewAnnouncementCount] = useState(0);
  const prevCount = useRef(0);

  useEffect(() => {
    const checkAnnouncements = async () => {
      try {
        const { data } = await axiosInstance.get('/announcements');
        const items = data.data || [];
        const lastViewed = localStorage.getItem('lastViewedAnnouncement');
        if (!lastViewed) {
          setNewAnnouncementCount(items.length);
        } else {
          const lastDate = new Date(lastViewed).getTime();
          const count = items.filter((i: any) => new Date(i.createdAt).getTime() > lastDate).length;
          setNewAnnouncementCount(count);
        }
      } catch (e) {}
    };
    
    checkAnnouncements();
    const interval = setInterval(checkAnnouncements, 60000); // Check every minute
    const handleRead = () => setNewAnnouncementCount(0);
    window.addEventListener('announcementsRead', handleRead);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('announcementsRead', handleRead);
    };
  }, []);

  const totalUnread = unreadCount + newAnnouncementCount;

  useEffect(() => {
    if (totalUnread > prevCount.current) {
      setIsRinging(true);
      setTimeout(() => setIsRinging(false), 1000);
    }
    prevCount.current = totalUnread;
  }, [totalUnread]);

  return (
    <div className="relative">
      <Link 
        href="/announcements"
        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none flex items-center justify-center"
      >
        <Bell className={`w-6 h-6 ${isRinging ? 'animate-[wiggle_0.3s_ease-in-out_2]' : ''}`} />
        {totalUnread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </Link>
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
