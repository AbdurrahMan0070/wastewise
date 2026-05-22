import { useState, useEffect } from 'react'
import Navbar          from './components/Navbar'
import Onboarding      from './components/Onboarding'
import ToastContainer  from './components/ToastContainer'
import ScannerNew      from './pages/ScannerNew'
import MapPage         from './pages/MapPage'
import Leaderboard     from './pages/Leaderboard'
import Dashboard       from './pages/Dashboard'
import { getUser }     from './lib/userStore'
import { registerServiceWorker, addOnlineListener } from './lib/pwa'
import { WifiOff }     from 'lucide-react'
import './index.css'

export default function App() {
  const [user,     setUser]     = useState(null)
  const [page,     setPage]     = useState('scanner')
  const [ready,    setReady]    = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const u = getUser()
    setUser(u)
    setReady(true)
    registerServiceWorker()
    const cleanup = addOnlineListener(() => setIsOnline(navigator.onLine))
    return cleanup
  }, [])

  if (!ready) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14, background:'var(--bg)' }}>
      <div style={{ width:40, height:40, border:'2px solid var(--border)', borderTop:'2px solid var(--green)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <div style={{ fontSize:13, color:'var(--dim)' }}>Loading WasteWise...</div>
    </div>
  )

  // Bottom nav height + safe area
  const bottomPad = 'calc(62px + env(safe-area-inset-bottom, 0px))'
  // Top nav height
  const topPad = '52px'

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {!user && <Onboarding onComplete={u => setUser(u)} />}

      <Navbar page={page} setPage={setPage} user={user} />

      {/* Offline banner */}
      {!isOnline && (
        <div style={{
          position:'fixed', top:60, left:'50%', transform:'translateX(-50%)',
          zIndex:9998, background:'rgba(245,158,11,0.1)',
          border:'1px solid rgba(245,158,11,0.3)', borderRadius:10,
          padding:'8px 16px', display:'flex', alignItems:'center', gap:8,
          fontSize:12, color:'var(--amber)', fontWeight:600,
        }}>
          <WifiOff size={14} strokeWidth={2} />
          You're offline — some features may be limited
        </div>
      )}

      {/* Page content — padded top + bottom so nothing hides behind navbars */}
      <div style={{
        paddingTop:    topPad,
        paddingBottom: bottomPad,
        minHeight:     '100vh',
        // Map needs full height so give it flex
        ...(page === 'map' ? { display:'flex', flexDirection:'column', height:'100vh' } : {}),
      }}>
        {page === 'scanner'     && <ScannerNew  user={user} onUserUpdate={u => setUser(u)} />}
        {page === 'map'         && <MapPage      user={user} style={{ flex:1 }} />}
        {page === 'leaderboard' && <Leaderboard  user={user} />}
        {page === 'dashboard'   && <Dashboard    user={user} onUserUpdate={u => setUser(u)} />}
      </div>

      <ToastContainer />
    </div>
  )
}
