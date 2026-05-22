import { useEffect, useState } from 'react'
import { Award, X, Sparkles } from 'lucide-react'

export default function AchievementPopup({ achievement, onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!achievement) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      animation: show ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border2)',
        borderRadius: 20,
        padding: '40px 32px',
        maxWidth: 400,
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        animation: show ? 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'scaleOut 0.3s ease-out',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Close button */}
        <button
          onClick={() => {
            setShow(false)
            setTimeout(onClose, 300)
          }}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'transparent',
            border: 'none',
            color: 'var(--dim)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} strokeWidth={2} />
        </button>

        {/* Sparkles decoration */}
        <div style={{
          position: 'absolute',
          top: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'float 2s ease-in-out infinite',
        }}>
          <Sparkles size={24} color={achievement.color} strokeWidth={2} />
        </div>

        {/* Achievement icon */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: `${achievement.color}15`,
          border: `2px solid ${achievement.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'bounce 0.6s ease-out',
        }}>
          <Award size={40} color={achievement.color} strokeWidth={2} />
        </div>

        {/* Text */}
        <div style={{
          fontSize: 12,
          color: 'var(--dim)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontWeight: 600,
        }}>
          Achievement Unlocked
        </div>

        <div style={{
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 8,
          letterSpacing: '-0.5px',
        }}>
          {achievement.title}
        </div>

        <div style={{
          fontSize: 14,
          color: 'var(--muted)',
          lineHeight: 1.5,
          marginBottom: 20,
        }}>
          {achievement.desc}
        </div>

        {/* Points badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          background: `${achievement.color}15`,
          border: `1px solid ${achievement.color}35`,
          borderRadius: 20,
          fontSize: 14,
          fontWeight: 600,
          color: achievement.color,
        }}>
          <Sparkles size={14} strokeWidth={2} />
          Achievement Earned
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes scaleOut {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.8); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
