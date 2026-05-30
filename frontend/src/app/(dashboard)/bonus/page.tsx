import { cookies } from 'next/headers';
import BonusClient from '@/components/features/bonus/BonusClient';

async function fetchBonusData(searchParams: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  if (!token) return null;

  const date = new Date();
  const month = searchParams.month || (date.getMonth() + 1);
  const year = searchParams.year || date.getFullYear();

  const params = new URLSearchParams({ month, year });
  if (searchParams.employeeId) params.append('employeeId', searchParams.employeeId);
  if (searchParams.type) params.append('type', searchParams.type);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bonus?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export default async function BonusPage({ searchParams }: any) {
  const data = await fetchBonusData(searchParams);
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full">
      <BonusClient initialData={data?.data || []} summary={data?.summary || {}} searchParams={searchParams} />
    </div>
  );
}
