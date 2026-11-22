import React from 'react'
import { formatStatusLabel } from '../../utils/formatUtils'
import { STATUS_COLORS } from '../../utils/constants'

function Badge({ status, label, className = '' }) {
  const display = label || formatStatusLabel(status)
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700 border border-gray-200'

  return (
    <span className={`badge ${colorClass} ${className}`}>
      {display}
    </span>
  )
}

export function StatusBadge({ status }) {
  return <Badge status={status} />
}

export default Badge
