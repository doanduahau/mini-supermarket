import { cookies } from 'next/headers';
import AnnouncementClient from '@/components/features/announcements/AnnouncementClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Thông báo | Mini HR',
};

async function getAnnouncements() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) redirect('/login');

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/announcements`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();
  return <AnnouncementClient initialAnnouncements={announcements} />;
}
