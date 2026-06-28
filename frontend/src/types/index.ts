export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'supermarket_owner' | 'shift_manager' | 'employee';
  status: 'active' | 'locked';
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  maxEmployees: number;
}

export interface ShiftAssignment {
  _id: string;
  employee: User | string;
  shift: Shift | string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  assignedBy?: User | string;
}

export interface Attendance {
  _id: string;
  employee: User | string;
  shift: Shift | string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  actualHours: number;
  recordedBy?: User | string;
  editHistory: any[];
}

export interface SalaryConfig {
  _id: string;
  role: string;
  hourlyRate: number;
  effectiveFrom: string;
}

export interface Bonus {
  _id: string;
  employee: User | string;
  month: number;
  year: number;
  amount: number;
  type: 'bonus' | 'penalty';
  reason: string;
}

export interface Payroll {
  _id: string;
  employee: User | string;
  month: number;
  year: number;
  totalHours: number;
  hourlyRate: number;
  baseSalary: number;
  bonusTotal: number;
  penaltyTotal: number;
  netSalary: number;
  status: 'draft' | 'confirmed';
  note?: string;
  breakdown: {
    attendanceRecords: any[];
    bonusRecords: any[];
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  summary?: any;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
