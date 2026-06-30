'use client';

import { useState, useEffect } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!userId || !token) return;
    
    connectSocket(token);
    const socket = getSocket();

    const addNotif = (type: Notification['type'], message: string, link?: string) => {
      setNotifications(prev => [{
        id: Date.now().toString() + Math.random(),
        type, 
        message, 
        read: false,
        createdAt: new Date(), 
        link
      }, ...prev].slice(0, 50));
    };

    const onShiftApproved = (data: any) => addNotif('success', data.message, '/my/schedule');
    const onShiftRejected = (data: any) => addNotif('warning', data.message, '/my/schedule');
    const onPayrollReady = (data: any) => addNotif('info', data.message, '/my/salary');
    const onAttendanceUpdated = (data: any) => addNotif('info', data.message, '/my/attendance');

    socket.on('notification:shift_approved', onShiftApproved);
    socket.on('notification:shift_rejected', onShiftRejected);
    socket.on('notification:payroll_ready', onPayrollReady);
    socket.on('notification:attendance_updated', onAttendanceUpdated);

    return () => {
      socket.off('notification:shift_approved', onShiftApproved);
      socket.off('notification:shift_rejected', onShiftRejected);
      socket.off('notification:payroll_ready', onPayrollReady);
      socket.off('notification:attendance_updated', onAttendanceUpdated);
      disconnectSocket();
    };
  }, [userId]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return { notifications, unreadCount, markAllRead, markRead };
}
