import React from 'react'

function LoadingSpinner({ size = 'md', color = 'blue', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  }
  const colors = {
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    purple: 'border-purple-600 border-t-transparent',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`}
        style={{ borderTopColor: 'transparent' }}
      />
    </div>
  )
}

export default LoadingSpinner
