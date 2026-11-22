import React from 'react'

function Card({ children, className = '', hover = false, padding = true }) {
  return (
    <div className={`
      glass-card rounded-2xl
      ${padding ? 'p-6' : ''}
      ${hover ? 'hover:shadow-xl transition-shadow duration-300 cursor-pointer hover:-translate-y-0.5' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = 'blue',
  trend,
  trendLabel,
  subtitle,
  className = ''
}) {
  const iconColors = {
    blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  }

  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconColors[iconColor]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Card
