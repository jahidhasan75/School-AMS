import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Clock, Users, BarChart2, Shield, CheckCircle, Smartphone, Globe, Lock } from 'lucide-react'

const allFeatures = [
  { icon: Clock, title: 'GPS Attendance', desc: 'Real-time GPS verification using the Haversine formula to ensure teachers are within school grounds.', color: 'blue' },
  { icon: Users, title: 'Leave Management', desc: 'Complete leave workflow from application to approval with document upload and admin notifications.', color: 'purple' },
  { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Visual Recharts-powered charts showing attendance trends, department stats, and teacher performance.', color: 'sky' },
  { icon: Shield, title: 'QR Code Attendance', desc: 'Time-limited QR code generation with backend token validation and expiry prevention.', color: 'green' },
  { icon: Smartphone, title: 'Mobile Responsive', desc: 'Fully responsive design that works on desktop, tablet, and mobile with touch-friendly controls.', color: 'orange' },
  { icon: Globe, title: 'Multi-language Ready', desc: 'Built with internationalization architecture ready for Bangla and English language support.', color: 'teal' },
  { icon: Lock, title: 'Role-Based Access', desc: 'Separate admin and teacher dashboards with server-side permission enforcement on all API routes.', color: 'red' },
  { icon: CheckCircle, title: 'Audit Trail', desc: 'Every attendance modification is logged with admin ID, timestamp, previous values, and reason.', color: 'indigo' },
]

const colorMap = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
  red: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-[#0B1224] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">School <span className="text-blue-600">AMS</span></span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">All Features</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Comprehensive tools for managing teacher attendance in Bangladeshi schools
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allFeatures.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="glass-card p-6 hover:-translate-y-1 transition-transform duration-200">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[f.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
        <div className="text-center mt-12">
          <Link to="/login" className="btn-primary inline-flex items-center gap-2 py-3 px-8 text-base">
            Get Started <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
