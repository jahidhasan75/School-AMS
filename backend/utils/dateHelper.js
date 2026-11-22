'use strict';
// Native date helpers — no external dependencies

/**
 * Get today's date in YYYY-MM-DD format
 */
const getToday = () => {
  return new Date().toISOString().slice(0, 10);
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date) => {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
};

/**
 * Get current time in HH:MM:SS format
 */
const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
};

/**
 * Parse time string "HH:MM:SS" into minutes from midnight
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 60 + parts[1] + (parts[2] || 0) / 60;
};

/**
 * Calculate minutes between two time strings
 */
const minutesBetweenTimes = (startTime, endTime) => {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  return Math.max(0, endMins - startMins);
};

/**
 * Determine attendance status based on check-in time and school settings
 */
const calculateAttendanceStatus = (checkInTime, officeStartTime, gracePeriodMinutes) => {
  const checkInMins = timeToMinutes(checkInTime);
  const startMins = timeToMinutes(officeStartTime);
  const deadline = startMins + gracePeriodMinutes;

  if (checkInMins <= deadline) {
    return 'present';
  } else {
    return 'late';
  }
};

/**
 * Get month range (start and end dates)
 */
const getMonthRange = (month, year) => {
  const date = new Date(year, month - 1, 1);
  const start = formatDate(new Date(date.getFullYear(), date.getMonth(), 1));
  const end = formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  return { start, end };
};

/**
 * Get working days in a date range (excluding weekends based on settings)
 */
const getWorkingDaysCount = (startDate, endDate, weekendDays = [5, 6]) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    if (!weekendDays.includes(dayOfWeek)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

module.exports = {
  getToday,
  formatDate,
  getCurrentTime,
  timeToMinutes,
  minutesBetweenTimes,
  calculateAttendanceStatus,
  getMonthRange,
  getWorkingDaysCount
};
