import { cookies } from 'next/headers';
import EmployeeListClient from '@/components/features/employees/EmployeeListClient';

async function fetchEmployees(params: Record<string, string>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  
  const urlParams = new URLSearchParams(params);
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users?${urlParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  
  if (!res.ok) return null;
  return res.json();
}

export default async function EmployeesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const resolvedParams = await searchParams;
  const data = await fetchEmployees(resolvedParams);
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <EmployeeListClient 
        initialData={data?.data || []} 
        meta={data?.pagination} 
        searchParams={resolvedParams} 
      />
    </div>
  );
}
