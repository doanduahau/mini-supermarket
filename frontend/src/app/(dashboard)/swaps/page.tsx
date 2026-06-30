import RoleGuard from '@/components/auth/RoleGuard';
import ManagerSwapsClient from '@/components/features/requests/ManagerSwapsClient';

export default function ManagerSwapsPage() {
  return (
    <RoleGuard allowedRoles={['supermarket_owner', 'shift_manager']}>
      <ManagerSwapsClient />
    </RoleGuard>
  );
}
