import { Leaf, ScanLine, Map, Trophy, LayoutDashboard } from 'lucide-react'

const NAV = [
  { id: 'scanner',     icon: ScanLine,       label: 'Scan'      },
  { id: 'map',         icon: Map,            label: 'Map'       },
  { id: 'leaderboard', icon: Trophy,         label: 'Rankings'  },
  { id: 'dashboard',   icon: LayoutDashboard,label: 'Impact'    },
]

export default function Navbar({ page, setPage, user }) {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(5,5,8,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      height: 58,
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      gap: 8,
    }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:9, marginRight:8 }}>
        <div style={{
          width:32, height:32, borderRadius:9,
          background:'linear-gradient(135deg,#16a34a,#15803d)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 14px rgba(34,197,94,0.3)',
          flexShrink:0,
        }}>
          <Leaf size={16} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize:15, fontWeight:700, letterSpacing:'-0.3px', color:'#fff', lineHeight:1 }}>WasteWise</div>
          <div style={{ fontSize:10, color:'var(--dim)', marginTop:1, letterSpacing:'0.04em' }}>Dispose Smarter</div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ display:'flex', alignItems:'center', gap:2, flex:1 }}>
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = page === id
          return (
            <button key={id} onClick={() => setPage(id)} style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'6px 12px', borderRadius:8,
              background: active ? 'var(--green-bg)' : 'transparent',
              border: `1px solid ${active ? 'var(--green-bdr)' : 'transparent'}`,
              color: active ? 'var(--green)' : 'var(--dim)',
              fontSize:13, fontWeight: active ? 500 : 400,
              cursor:'pointer', transition:'all 0.15s',
              fontFamily:'var(--font)',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--muted)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--dim)' }}
            >
              <Icon size={14} strokeWidth={active ? 2.5 : 2} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* User badge */}
      {user && (
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          background:'var(--surface2)', border:'1px solid var(--border)',
          padding:'5px 12px', borderRadius:20, fontSize:12,
        }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)', flexShrink:0 }} />
          <span style={{ color:'var(--muted)' }}>{user.username}</span>
          <span style={{ color:'var(--green)', fontWeight:600, fontFamily:'var(--mono)' }}>
            {user.total_points.toLocaleString()} pts
          </span>
        </div>
      )}
    </header>
  )
}
