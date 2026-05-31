'use client'

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '@/lib/axios';
import { User, LoginCredentials } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const refreshUser = async () => {
    try {
      const { data } = await axiosInstance.get('/auth/me');
      setState(prev => ({
        ...prev,
        user: data.data,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error) {
      localStorage.removeItem('accessToken');
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setState({
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Set token immediately, then verify with server
      setState(prev => ({ ...prev, accessToken: token, isLoading: true }));
      refreshUser();
    } else {
      // No token: immediately mark as not loading, not authenticated
      setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const { data } = await axiosInstance.post('/auth/login', credentials);
    const { accessToken, user } = data.data;
    
    localStorage.setItem('accessToken', accessToken);
    
    // Đồng bộ vào cookie để Next.js middleware có thể bảo vệ route
    document.cookie = `accessToken=${accessToken}; path=/; max-age=86400`;

    setState({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false
    });
    
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Lỗi khi logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false
      });
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
