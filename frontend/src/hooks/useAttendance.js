import { useState, useEffect, useCallback } from 'react'
import attendanceService from '../services/attendanceService'

export const useAttendance = () => {
  const [todayStatus, setTodayStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [checkOutLoading, setCheckOutLoading] = useState(false)

  const fetchTodayStatus = useCallback(async () => {
    try {
      const res = await attendanceService.getTodayStatus()
      setTodayStatus(res.data.data)
    } catch (err) {
      setTodayStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodayStatus()
  }, [fetchTodayStatus])

  const checkIn = useCallback(async (latitude, longitude) => {
    setCheckInLoading(true)
    try {
      const res = await attendanceService.checkIn({ latitude, longitude })
      setTodayStatus(res.data.data)
      return res.data
    } finally {
      setCheckInLoading(false)
    }
  }, [])

  const checkOut = useCallback(async (latitude, longitude) => {
    setCheckOutLoading(true)
    try {
      const res = await attendanceService.checkOut({ latitude, longitude })
      setTodayStatus(res.data.data)
      return res.data
    } finally {
      setCheckOutLoading(false)
    }
  }, [])

  return {
    todayStatus,
    loading,
    checkInLoading,
    checkOutLoading,
    checkIn,
    checkOut,
    refetch: fetchTodayStatus,
  }
}

export default useAttendance
