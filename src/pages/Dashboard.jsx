import { useState, useEffect } from 'react'
import { Leaf, Zap, Star, BarChart3, Target, Award, TrendingUp, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getUser, clearUser } from '../lib/userStore'
import { CATEGORIES } from '../lib/data'
import { SkeletonStats, SkeletonList } from '../components/Skeleton'

function StatCard({ label, value, sub, icon: Icon, color, big }) {
  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius:14, padding: big ? '20px' : '16px',
      display:'flex', flexDirection:'column', gap:4,
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <div style={{ fontSize:11, color:'var(--dim)', letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</div>
        <div style={{ width:30,height:30,borderRadius:8,background:`${color}15`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Icon size={14} color={color} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: big ? 32 : 24, fontWeight:700, color, letterSpacing:'-0.5px', fontFamily:'var(--mono)' }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'var(--dim)' }}>{sub}</div>}
    </div>
  )
}

function ProgressBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:12, color:'var(--muted)' }}>{label}</span>
        <span style={{ fontSize:12, color, fontWeight:600, fontFamily:'var(--mono)' }}>{value}/{max}</span>
      </div>
      <div style={{ height:6, background:'var(--surface3)', borderRadius:10, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:10, transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  )
}

function BadgeCard({ title, desc, earned, color, icon: Icon }) {
  return (
    <div style={{
      background: earned ? `${color}08` : 'var(--surface2)',
      border:`1px solid ${earned ? `${color}25` : 'var(--border)'}`,
      borderRadius:12, padding:'14px', textAlign:'center',
      opacity: earned ? 1 : 0.4, transition:'all 0.2s',
    }}>
      <div style={{ width:40,height:40,borderRadius:12,background:`${color}15`,border:`1px solid ${color}25`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px' }}>
        <Icon size={18} color={earned ? color : 'var(--dim)'} strokeWidth={1.5} />
      </div>
      <div style={{ fontSize:12,fontWeight:600,marginBottom:3, color: earned ? 'var(--text)' : 'var(--dim)' }}>{title}</div>
      <div style={{ fontSize:10,color:'var(--dim)',lineHeight:1.4 }}>{desc}</div>
    </div>
  )
}

export default function Dashboard({ user, onUserUpdate }) {
  const [cityStats, setCityStats] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        // City stats
        const { data: cityData } = await supabase
          .from('scans')
          .select('category,co2_saved,points')
          .eq('city', user?.city || 'Mumbai')
        if (cityData) {
          const totals = cityData.reduce((acc, s) => ({
            scans:    acc.scans + 1,
            co2:      acc.co2  + (s.co2_saved || 0),
            points:   acc.points + (s.points || 0),
          }), { scans:0, co2:0, points:0 })
          setCityStats(totals)
        }

        // Recent scans globally
        const { data: recent } = await supabase
          .from('scans')
          .select('username,item_name,category,co2_saved,created_at')
          .order('created_at', { ascending: false })
          .limit(10)
        if (recent) setRecentScans(recent)
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [user])

  const pts   = user?.total_points  || 0
  const scans = user?.items_scanned || 0
  const co2   = user?.co2_saved     || 0
  const tags  = user?.items_tagged  || 0

  const BADGES = [
    { title:'First Scan',     desc:'Complete your first scan',             earned: scans >= 1,  color:'var(--green)',  icon: Leaf      },
    { title:'10 Scans',       desc:'Scan 10 items correctly',              earned: scans >= 10, color:'var(--blue)',   icon: Star      },
    { title:'50 Scans',       desc:'Scan 50 items correctly',              earned: scans >= 50, color:'var(--purple)', icon: Award     },
    { title:'First Tag',      desc:'Tag an item for the community',        earned: tags  >= 1,  color:'var(--amber)',  icon: Target    },
    { title:'CO₂ Saver',      desc:'Save 1kg of CO₂',                     earned: co2   >= 1,  color:'var(--lime)',   icon: TrendingUp},
    { title:'100 Points',     desc:'Reach 100 points',                     earned: pts   >= 100,color:'var(--cyan)',   icon: Zap       },
  ]

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'80px 20px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:11, color:'var(--dim)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>
          Personal Impact
        </div>
        <div style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.5px' }}>
          Hey {user?.username} —
        </div>
        <div style={{ fontSize:14, color:'var(--muted)', marginTop:4 }}>
          {pts === 0
            ? "Start scanning to build your impact. Every item counts."
            : `You've earned ${pts} points and saved ${co2.toFixed(2)}kg of CO₂. Keep going.`}
        </div>
      </div>

      {/* Key stats */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:20 }}>
          <StatCard big label="Total Points"    value={pts.toLocaleString()}      sub="Lifetime earnings"               icon={Zap}      color="var(--amber)" />
          <StatCard big label="CO₂ Saved"       value={`${co2.toFixed(2)}kg`}     sub="From correct disposal"          icon={Leaf}     color="var(--green)" />
          <StatCard     label="Items Scanned"   value={scans}                     sub="Correctly disposed"              icon={BarChart3}color="var(--blue)"  />
          <StatCard     label="Items Tagged"    value={tags}                      sub="+5 pts each"                     icon={Target}   color="var(--purple)"/>
        </div>
      )}

      {/* Progress to next level */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:16 }}>Progress</div>
        <ProgressBar label="Scans to next badge"    value={scans} max={scans < 10 ? 10 : scans < 50 ? 50 : 100} color="var(--green)"  />
        <ProgressBar label="Points milestone"       value={pts}   max={pts < 100 ? 100 : pts < 500 ? 500 : 1000} color="var(--amber)" />
        <ProgressBar label="CO₂ saved target (5kg)" value={co2}   max={5}                                          color="var(--lime)"  />
      </div>

      {/* Badges */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>
          Badges — {BADGES.filter(b => b.earned).length}/{BADGES.length} earned
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {BADGES.map(b => <BadgeCard key={b.title} {...b} />)}
        </div>
      </div>

      {/* City stats */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:600 }}>{user?.city || 'Your City'} — Community Impact</div>
          {loading && <div style={{ width:16,height:16,border:'2px solid var(--border)',borderTop:'2px solid var(--green)',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { label:'City Scans',  value: cityStats ? cityStats.scans.toLocaleString()    : '—', color:'var(--blue)'  },
            { label:'City CO₂',    value: cityStats ? `${cityStats.co2.toFixed(1)}kg`     : '—', color:'var(--green)' },
            { label:'City Points', value: cityStats ? cityStats.points.toLocaleString()   : '—', color:'var(--amber)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px', textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:700, color, fontFamily:'var(--mono)', marginBottom:4 }}>{value}</div>
              <div style={{ fontSize:11, color:'var(--dim)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent global activity */}
      {loading ? (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Live Global Activity</div>
          <SkeletonList count={6} />
        </div>
      ) : recentScans.length > 0 && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>Live Global Activity</div>
          {recentScans.slice(0,6).map((s, i) => {
            const cat = CATEGORIES[s.category] || CATEGORIES['General Waste']
            const time = new Date(s.created_at)
            const mins = Math.floor((Date.now() - time) / 60000)
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width:28,height:28,borderRadius:7,background:cat.bg,border:`1px solid ${cat.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <Leaf size={12} color={cat.color} strokeWidth={2} />
                </div>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:13, color:'var(--text)', fontWeight:500 }}>{s.username}</span>
                  <span style={{ fontSize:13, color:'var(--muted)' }}> disposed of </span>
                  <span style={{ fontSize:13, color: cat.color, fontWeight:500 }}>{s.item_name}</span>
                </div>
                <div style={{ fontSize:11, color:'var(--dim)', flexShrink:0 }}>
                  {mins < 1 ? 'just now' : mins < 60 ? `${mins}m ago` : `${Math.floor(mins/60)}h ago`}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reset */}
      <div style={{ textAlign:'center' }}>
        <button onClick={() => { clearUser(); window.location.reload() }} style={{
          background:'transparent', border:'1px solid var(--border)', borderRadius:8,
          padding:'8px 16px', color:'var(--dim)', fontSize:12, cursor:'pointer',
          display:'inline-flex', alignItems:'center', gap:6, fontFamily:'var(--font)',
        }}>
          <RefreshCw size={12} strokeWidth={2} /> Reset my account
        </button>
      </div>
    </div>
  )
}
