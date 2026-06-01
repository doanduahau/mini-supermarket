export function getAttendanceStatus(a: any) {
  const d = new Date(a.date);
  d.setUTCHours(0, 0, 0, 0);
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  if (!a.checkIn) {
    if (d.getTime() > now.getTime()) return 'upcoming';
    if (d.getTime() < now.getTime()) return 'absent';
    return 'pending'; // Today, hasn't checked in yet
  }

  // checkIn exists
  let isLate = false;
  let isEarlyLeave = false;

  if (a.shift?.startTime) {
    const [h, m] = a.shift.startTime.split(':').map(Number);
    const startT = new Date(a.date);
    startT.setHours(h, m, 0, 0);
    // strictly > startT is late
    if (new Date(a.checkIn).getTime() > startT.getTime()) {
      isLate = true;
    }
  }

  if (a.shift?.endTime && a.checkOut) {
    const [h, m] = a.shift.endTime.split(':').map(Number);
    const endT = new Date(a.date);
    endT.setHours(h, m, 0, 0);
    if (a.shift.startTime) {
      const [sh] = a.shift.startTime.split(':').map(Number);
      if (h < sh) endT.setDate(endT.getDate() + 1); // overnight shift
    }
    // strictly < endT is early leave
    if (new Date(a.checkOut).getTime() < endT.getTime()) {
      isEarlyLeave = true;
    }
  }

  if (isLate && isEarlyLeave) return 'wrong_time';
  if (isLate) return 'late';
  if (isEarlyLeave) return 'early_leave';
  return 'present';
}
