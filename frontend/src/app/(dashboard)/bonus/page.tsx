import { cookies } from 'next/headers';
import BonusClient from '@/components/features/bonus/BonusClient';

async function fetchBonusData(sp: Record<string, string>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  if (!token) return null;

  const date = new Date();
  const month = sp.month || (date.getMonth() + 1);
  const year = sp.year || date.getFullYear();

  const params = new URLSearchParams({ month: String(month), year: String(year) });
  if (sp.employeeId) params.append('employeeId', sp.employeeId);
  if (sp.type) params.append('type', sp.type);

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

export default async function BonusPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const resolvedParams = await searchParams;
  const data = await fetchBonusData(resolvedParams);
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full">
      <BonusClient initialData={data?.data || []} summary={data?.summary || {}} searchParams={resolvedParams} />
    </div>
  );
}
