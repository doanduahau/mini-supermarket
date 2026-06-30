'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function RoleGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router, allowedRoles]);

  if (isLoading || (user && !allowedRoles.includes(user.role))) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return <>{children}</>;
}
