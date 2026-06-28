import { cookies } from 'next/headers';

export async function serverFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value ?? '';

  const res = await fetch(
    `${process.env.API_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers
      },
      cache: options?.cache ?? 'no-store'
    }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (res.status === 403) throw new Error('FORBIDDEN');
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}
