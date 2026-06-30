import RoleGuard from '@/components/auth/RoleGuard';
import ManagerRequestsClient from '@/components/features/requests/ManagerRequestsClient';

export default function ManagerRequestsPage() {
  return (
    <RoleGuard allowedRoles={['supermarket_owner', 'shift_manager']}>
      <ManagerRequestsClient />
    </RoleGuard>
  );
}
