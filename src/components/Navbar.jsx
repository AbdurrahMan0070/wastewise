import { Leaf, ScanLine, Map, Trophy, LayoutDashboard } from 'lucide-react'

const NAV = [
  { id: 'scanner',     icon: ScanLine,        label: 'Scan'    },
  { id: 'map',         icon: Map,             label: 'Map'     },
  { id: 'leaderboard', icon: Trophy,          label: 'Rankings'},
  { id: 'dashboard',   icon: LayoutDashboard, label: 'Impact'  },
]

export default function Navbar({ page, setPage, user }) {
  return (
    <>
      {/* Top header — logo + points only */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(5,5,8,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        height: 52,
        display: 'flex', alignItems: 'center',
        padding: '0 16px',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg,#16a34a,#15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(34,197,94,0.3)',
            flexShrink: 0,
          }}>
            <Leaf size={15} color="#fff" strokeWidth={2.5} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', color: '#fff' }}>
            WasteWise
          </div>
        </div>

        {/* User points pill */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            padding: '4px 10px', borderRadius: 20, fontSize: 12,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ color: 'var(--muted)' }}>{user.username}</span>
            <span style={{ color: 'var(--green)', fontWeight: 700, fontFamily: 'var(--mono)' }}>
              {(user.total_points || 0).toLocaleString()} pts
            </span>
          </div>
        )}
      </header>

      {/* Bottom tab bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(5,5,8,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = page === id
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 4, padding: '10px 4px',
                background: 'transparent', border: 'none',
                color: active ? 'var(--green)' : 'var(--dim)',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font)',
                position: 'relative',
              }}
            >
              {/* Active indicator dot */}
              {active && (
                <div style={{
                  position: 'absolute', top: 6, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--green-bg)',
                  border: '1px solid var(--green-bdr)',
                }} />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ position: 'relative', zIndex: 1 }}
              />
              <span style={{
                fontSize: 10, fontWeight: active ? 600 : 400,
                letterSpacing: '0.02em',
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
