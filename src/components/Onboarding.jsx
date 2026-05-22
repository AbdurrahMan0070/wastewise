import { useState } from 'react'
import { Leaf, MapPin, ArrowRight } from 'lucide-react'
import { createUser } from '../lib/userStore'

const CITIES = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Other']

export default function Onboarding({ onComplete }) {
  const [username, setUsername] = useState('')
  const [city,     setCity]     = useState('Mumbai')
  const [error,    setError]    = useState('')

  const submit = () => {
    if (!username.trim() || username.trim().length < 2) {
      setError('Enter a username with at least 2 characters')
      return
    }
    const user = createUser(username, city)
    onComplete(user)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:999,
      background:'rgba(5,5,8,0.95)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:20,
    }}>
      <div className="scale-in" style={{
        background:'var(--surface)', border:'1px solid var(--border2)',
        borderRadius:20, padding:'40px 36px', maxWidth:420, width:'100%',
      }}>
        {/* Icon */}
        <div style={{
          width:56, height:56, borderRadius:16,
          background:'linear-gradient(135deg,#16a34a,#15803d)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 24px rgba(34,197,94,0.3)', marginBottom:20,
        }}>
          <Leaf size={26} color="#fff" strokeWidth={2} />
        </div>

        <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.5px', marginBottom:6 }}>Welcome to WasteWise</div>
        <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.6, marginBottom:28 }}>
          Scan any item, learn how to dispose of it correctly, earn points, and help your city go greener. No account needed.
        </div>

        {/* Username */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, color:'var(--dim)', letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:8 }}>
            Your Name / Username
          </label>
          <input
            value={username}
            onChange={e => { setUsername(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="e.g. Abdurrahman"
            autoFocus
            style={{
              width:'100%', background:'var(--surface2)',
              border:`1px solid ${error ? 'var(--red)' : 'var(--border2)'}`,
              borderRadius:10, padding:'11px 14px',
              color:'var(--text)', fontSize:14,
              outline:'none', fontFamily:'var(--font)',
              transition:'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border2)'}
          />
          {error && <div style={{ fontSize:12, color:'var(--red)', marginTop:6 }}>{error}</div>}
        </div>

        {/* City */}
        <div style={{ marginBottom:28 }}>
          <label style={{ fontSize:12, color:'var(--dim)', letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:8 }}>
            Your City
          </label>
          <div style={{ position:'relative' }}>
            <MapPin size={14} color="var(--dim)" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              style={{
                width:'100%', background:'var(--surface2)',
                border:'1px solid var(--border2)', borderRadius:10,
                padding:'11px 14px 11px 34px',
                color:'var(--text)', fontSize:14,
                outline:'none', cursor:'pointer', fontFamily:'var(--font)',
                appearance:'none',
              }}
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* CTA */}
        <button onClick={submit} style={{
          width:'100%', background:'#16a34a', border:'none',
          borderRadius:12, padding:'13px', color:'#fff',
          fontSize:15, fontWeight:600, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          boxShadow:'0 0 20px rgba(34,197,94,0.25)', transition:'all 0.2s',
          fontFamily:'var(--font)',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
          onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
        >
          Get Started
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>

        <div style={{ fontSize:11, color:'var(--dim)', textAlign:'center', marginTop:14, lineHeight:1.5 }}>
          No account, no password, no tracking. Your data stays on your device.
        </div>
      </div>
    </div>
  )
}
