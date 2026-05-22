import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const TOAST_TYPES = {
  success: { icon: CheckCircle, color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-bdr)' },
  error: { icon: AlertCircle, color: 'var(--red)', bg: 'var(--red-bg)', border: 'rgba(239,68,68,0.2)' },
  info: { icon: Info, color: 'var(--blue)', bg: 'var(--blue-bg)', border: 'rgba(59,130,246,0.2)' },
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const config = TOAST_TYPES[type] || TOAST_TYPES.success
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div style={{
      position: 'fixed',
      top: 80,
      right: 20,
      zIndex: 9999,
      minWidth: 300,
      maxWidth: 400,
      background: 'var(--surface)',
      border: `1px solid ${config.border}`,
      borderRadius: 12,
      padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      animation: 'slideInRight 0.3s ease-out',
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: config.bg,
        border: `1px solid ${config.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} color={config.color} strokeWidth={2} />
      </div>
      
      <div style={{ flex: 1, fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>
        {message}
      </div>
      
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--dim)',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <X size={16} strokeWidth={2} />
      </button>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
