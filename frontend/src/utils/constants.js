export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent',
  HALF_DAY: 'half_day',
  ON_LEAVE: 'on_leave',
  EARLY_LEAVE: 'early_leave',
  HOLIDAY: 'holiday',
}

export const LEAVE_TYPES = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'emergency', label: 'Emergency Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'annual', label: 'Annual Leave' },
]

export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
}

export const NOTIFICATION_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'leave', label: 'Leave' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'correction', label: 'Correction' },
]

export const DEPARTMENTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Physical Education',
  'Arts',
  'Music',
  'Languages',
  'Administration',
]

export const STATUS_COLORS = {
  present: 'badge-present',
  late: 'badge-late',
  absent: 'badge-absent',
  on_leave: 'badge-leave',
  half_day: 'badge-late',
  early_leave: 'badge-leave',
  holiday: 'badge-leave',
  pending: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
}

export const CHART_COLORS = {
  present: '#16A34A',
  late: '#F59E0B',
  absent: '#EF4444',
  on_leave: '#2563EB',
}

export const PAGE_SIZES = [10, 20, 50, 100]
