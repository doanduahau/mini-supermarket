// ─── User Roles ───────────────────────────────────────────────────────────────
const ROLES = Object.freeze({
  SUPERMARKET_OWNER: 'supermarket_owner',
  SHIFT_MANAGER: 'shift_manager',
  EMPLOYEE: 'employee',
});

// ─── Employee Status ──────────────────────────────────────────────────────────
const EMPLOYEE_STATUS = Object.freeze({
  ACTIVE: 'active',
  LOCKED: 'locked',
});

// ─── Attendance Status ────────────────────────────────────────────────────────
const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  LEAVE: 'leave',
});

// ─── Pagination Defaults ──────────────────────────────────────────────────────
const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

module.exports = { ROLES, EMPLOYEE_STATUS, ATTENDANCE_STATUS, PAGINATION };
