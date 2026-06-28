import { cookies } from 'next/headers';
import ShiftClient from '@/components/features/shifts/ShiftClient';

// Next.js 14 ISR Configuration - Revalidate every 5 minutes
export const revalidate = 300; 

async function fetchInitialData() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  if (!token) return { shifts: [] };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/shifts`, {
      headers: { Authorization: `Bearer ${token}` },
      // Next.js 14 requires manual fetch cache behavior if not using export const revalidate
      next: { revalidate: 300 }
    });
    
    if (!res.ok) return { shifts: [] };
    const data = await res.json();
    return { shifts: data.data };
  } catch (error) {
    return { shifts: [] };
  }
}

export default async function ShiftsPage() {
  const { shifts } = await fetchInitialData();
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full">
      <ShiftClient initialShifts={shifts} />
    </div>
  );
}
