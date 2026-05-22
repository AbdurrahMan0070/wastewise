export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: 16,
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{
        height: 20,
        background: 'var(--surface2)',
        borderRadius: 6,
        marginBottom: 12,
        width: '60%',
      }} />
      <div style={{
        height: 40,
        background: 'var(--surface2)',
        borderRadius: 8,
        marginBottom: 8,
      }} />
      <div style={{
        height: 16,
        background: 'var(--surface2)',
        borderRadius: 6,
        width: '80%',
      }} />
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'var(--surface3)',
            flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              height: 14,
              background: 'var(--surface3)',
              borderRadius: 4,
              marginBottom: 6,
              width: '70%',
            }} />
            <div style={{
              height: 12,
              background: 'var(--surface3)',
              borderRadius: 4,
              width: '50%',
            }} />
          </div>
        </div>
      ))}
    </>
  )
}

export function SkeletonStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 16,
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.1}s`,
        }}>
          <div style={{
            height: 12,
            background: 'var(--surface2)',
            borderRadius: 4,
            marginBottom: 10,
            width: '50%',
          }} />
          <div style={{
            height: 32,
            background: 'var(--surface2)',
            borderRadius: 6,
            marginBottom: 6,
            width: '70%',
          }} />
          <div style={{
            height: 10,
            background: 'var(--surface2)',
            borderRadius: 4,
            width: '60%',
          }} />
        </div>
      ))}
    </div>
  )
}
