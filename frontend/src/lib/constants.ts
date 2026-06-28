export const ROLES = {
  OWNER: 'supermarket_owner',
  MANAGER: 'shift_manager',
  EMPLOYEE: 'employee'
} as const;

export const ROLE_LABELS: Record<string, string> = {
  supermarket_owner: 'Chủ siêu thị',
  shift_manager: 'Quản lý ca',
  employee: 'Nhân viên'
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Đang hoạt động',
  locked: 'Đã khóa'
};

export const SHIFT_ASSIGNMENT_STATUS = {
  pending: { label: 'Chờ duyệt', color: 'yellow' },
  approved: { label: 'Đã duyệt', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' }
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
};
