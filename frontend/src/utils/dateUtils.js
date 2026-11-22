import { format, parseISO, isValid, differenceInMinutes, startOfMonth, endOfMonth } from 'date-fns'

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? format(d, fmt) : 'N/A'
}

export const formatTime = (time) => {
  if (!time) return 'N/A'
  // Handle "HH:mm:ss" format
  if (typeof time === 'string' && time.includes(':')) {
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${m} ${ampm}`
  }
  return time
}

export const formatDateTime = (dt) => {
  if (!dt) return 'N/A'
  const d = typeof dt === 'string' ? parseISO(dt) : dt
  return isValid(d) ? format(d, 'MMM dd, yyyy HH:mm') : 'N/A'
}

export const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export const getMonthRange = (year, month) => {
  const date = new Date(year, month - 1, 1)
  return {
    start: format(startOfMonth(date), 'yyyy-MM-dd'),
    end: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 'N/A'
  const [h1, m1] = checkIn.split(':').map(Number)
  const [h2, m2] = checkOut.split(':').map(Number)
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (mins <= 0) return 'N/A'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

export const getDayName = (date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE')
}

export const isWeekend = (date) => {
  const d = typeof date === 'string' ? parseISO(date) : date
  const day = d.getDay()
  return day === 0 || day === 6
}
