import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, FileText, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import reportService from '../../services/reportService'

const COLORS = ['#2563EB','#7C3AED','#16A34A','#F59E0B','#EF4444']

export default function ReportsPage() {
  const [reportType, setReportType] = useState('monthly')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadReport = async () => {
    setLoading(true)
    try {
      let res
      if (reportType === 'monthly') res = await reportService.getMonthly({ month, year })
      else if (reportType === 'daily') res = await reportService.getDaily({ date: new Date().toISOString().split('T')[0] })
      else if (reportType === 'department') res = await reportService.getDepartment()
      setData(res.data.data)
    } catch (err) {
      toast.error('Failed to load report')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadReport() }, [reportType, month, year])

  const exportCSV = () => {
    if (!data) return
    const rows = Array.isArray(data) ? data : [data]
    const csv = rows.map(r => Object.values(r).join(',')).join('\n')
    const blob = new Blob([`${Object.keys(rows[0] || {}).join(',')}\n${csv}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${reportType}_report.csv`; a.click()
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const years = [2022,2023,2024,2025,2026]

  // Build chart data
  const chartData = Array.isArray(data) ? data.map(r => ({
    name: r.teacher?.full_name?.split(' ')[0] || r.name || r.department || 'N/A',
    present: parseInt(r.present) || 0,
    late: parseInt(r.late) || 0,
    absent: parseInt(r.absent) || 0,
    on_leave: parseInt(r.on_leave) || 0,
  })) : []

  const deptData = Array.isArray(data) ? data.map((r, i) => ({
    name: r.department || r.name || `Item ${i+1}`,
    value: (parseInt(r.present) || 0) + (parseInt(r.late) || 0),
    color: COLORS[i % COLORS.length]
  })) : []

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Generate and analyze attendance reports</p>
        </div>
        <button onClick={exportCSV} className="glass-card text-sm py-2 px-4 flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Controls */}
      <div className="glass-card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Report Type</label>
          <select value={reportType} onChange={e => setReportType(e.target.value)} className="form-input py-2 w-40">
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
            <option value="department">By Department</option>
          </select>
        </div>
        {reportType === 'monthly' && <>
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Month</label>
            <select value={month} onChange={e => setMonth(e.target.value)} className="form-input py-2 w-32">
              {months.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">Year</label>
            <select value={year} onChange={e => setYear(e.target.value)} className="form-input py-2 w-24">
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </>}
      </div>

      {/* Charts */}
      {loading ? (
        <div className="glass-card p-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : chartData.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
              {reportType === 'department' ? 'Department-wise Attendance' : 'Teacher-wise Attendance'}
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData.slice(0, 10)} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="present" fill="#16A34A" radius={[4,4,0,0]} />
                <Bar dataKey="late" fill="#F59E0B" radius={[4,4,0,0]} />
                <Bar dataKey="absent" fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4">Distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={deptData.slice(0, 8)} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {deptData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="glass-card p-16 text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No report data available for the selected period</p>
        </div>
      )}

      {/* Table */}
      {chartData.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="text-base font-semibold text-gray-800 dark:text-white">Detailed Report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <th>{reportType === 'department' ? 'Department' : 'Teacher'}</th>
                <th>Present</th><th>Late</th><th>Absent</th><th>Leave</th><th>Total Days</th>
              </tr></thead>
              <tbody>
                {chartData.map((r, i) => (
                  <tr key={i}>
                    <td className="font-medium text-gray-900 dark:text-white">{r.name}</td>
                    <td><span className="badge-present px-2 py-0.5 rounded text-xs font-semibold">{r.present}</span></td>
                    <td><span className="badge-late px-2 py-0.5 rounded text-xs font-semibold">{r.late}</span></td>
                    <td><span className="badge-absent px-2 py-0.5 rounded text-xs font-semibold">{r.absent}</span></td>
                    <td><span className="badge-on_leave px-2 py-0.5 rounded text-xs font-semibold">{r.on_leave}</span></td>
                    <td className="font-semibold text-gray-900 dark:text-white">{r.present + r.late + r.absent + r.on_leave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
