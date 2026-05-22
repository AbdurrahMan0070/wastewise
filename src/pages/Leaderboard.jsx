import { useState, useEffect } from 'react'
import { Trophy, Medal, Star, Zap, Leaf, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getUser } from '../lib/userStore'
import { SkeletonList } from '../components/Skeleton'

const MOCK_LEADERS = [
  { username:'EcoWarrior_Priya',  city:'Mumbai',    total_points:2840, items_scanned:312, co2_saved:28.4 },
  { username:'GreenMachineRahul', city:'Delhi',     total_points:2210, items_scanned:241, co2_saved:22.1 },
  { username:'RecycleKingAli',    city:'Bangalore', total_points:1990, items_scanned:198, co2_saved:19.9 },
  { username:'EarthFirst_Sara',   city:'Hyderabad', total_points:1750, items_scanned:175, co2_saved:17.5 },
  { username:'ZeroWasteZara',     city:'Pune',      total_points:1620, items_scanned:162, co2_saved:16.2 },
  { username:'CleanCityAmit',     city:'Chennai',   total_points:1480, items_scanned:148, co2_saved:14.8 },
  { username:'PlanetSaverNeha',   city:'Mumbai',    total_points:1340, items_scanned:134, co2_saved:13.4 },
  { username:'RecycleRockstar',   city:'Kolkata',   total_points:1210, items_scanned:121, co2_saved:12.1 },
  { username:'GreenGuruKaran',    city:'Ahmedabad', total_points:1090, items_scanned:109, co2_saved:10.9 },
  { username:'EcoChampRiya',      city:'Delhi',     total_points:980,  items_scanned:98,  co2_saved:9.8  },
]

function RankBadge({ rank }) {
  if (rank === 1) return (
    <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#d97706)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 0 12px rgba(245,158,11,0.4)' }}>
      <Trophy size={15} color="#fff" strokeWidth={2.5} />
    </div>
  )
  if (rank === 2) return (
    <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#94a3b8,#64748b)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
      <Medal size={15} color="#fff" strokeWidth={2.5} />
    </div>
  )
  if (rank === 3) return (
    <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#c2794a,#a05c35)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
      <Medal size={15} color="#fff" strokeWidth={2.5} />
    </div>
  )
  return (
    <div style={{ width:32,height:32,borderRadius:'50%',background:'var(--surface3)',border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
      <span style={{ fontSize:12,fontWeight:700,color:'var(--dim)',fontFamily:'var(--mono)' }}>{rank}</span>
    </div>
  )
}

function LeaderRow({ entry, rank, isMe }) {
  const pts = entry.total_points || 0
  return (
    <div className="fade-in" style={{
      display:'flex', alignItems:'center', gap:14,
      padding:'14px 16px', borderRadius:12,
      background: isMe ? 'rgba(34,197,94,0.06)' : rank <= 3 ? 'var(--surface2)' : 'var(--surface)',
      border: `1px solid ${isMe ? 'var(--green-bdr)' : rank <= 3 ? 'var(--border2)' : 'var(--border)'}`,
      marginBottom:8, transition:'all 0.15s',
      animationDelay:`${rank * 0.04}s`,
    }}>
      <RankBadge rank={rank} />

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:14, fontWeight:600, color: isMe ? 'var(--green)' : 'var(--text)' }}>
            {entry.username}
          </span>
          {isMe && (
            <span style={{ fontSize:10, padding:'2px 7px', borderRadius:10, background:'var(--green-bg)', color:'var(--green)', border:'1px solid var(--green-bdr)', fontWeight:600 }}>
              You
            </span>
          )}
        </div>
        <div style={{ fontSize:11, color:'var(--dim)', marginTop:2 }}>{entry.city || 'Unknown'}</div>
      </div>

      <div style={{ display:'flex', gap:16, alignItems:'center' }}>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:11, color:'var(--dim)', marginBottom:2 }}>CO₂ Saved</div>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--green)', fontFamily:'var(--mono)' }}>
            {(entry.co2_saved || 0).toFixed(1)}kg
          </div>
        </div>
        <div style={{ textAlign:'right', minWidth:60 }}>
          <div style={{ fontSize:11, color:'var(--dim)', marginBottom:2 }}>Points</div>
          <div style={{ fontSize:16, fontWeight:700, color: rank===1 ? '#f59e0b' : rank===2 ? '#94a3b8' : rank===3 ? '#c2794a' : 'var(--text)', fontFamily:'var(--mono)' }}>
            {pts.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const [leaders,  setLeaders]  = useState(MOCK_LEADERS)
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('Global')
  const me = getUser()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await supabase
          .from('users')
          .select('username,city,total_points,items_scanned,co2_saved')
          .order('total_points', { ascending: false })
          .limit(50)
        if (data && data.length > 0) {
          setLeaders([...data, ...MOCK_LEADERS].sort((a,b) => (b.total_points||0)-(a.total_points||0)).slice(0,20))
        }
      } catch(e) {}
      setLoading(false)
    }
    load()
  }, [])

  // Inject current user if not in list
  const displayList = (() => {
    if (!me) return leaders
    const inList = leaders.find(l => l.username === me.username)
    if (inList) return leaders
    return [...leaders, { ...me }].sort((a,b) => (b.total_points||0)-(a.total_points||0))
  })()

  const myRank = me ? displayList.findIndex(l => l.username === me.username) + 1 : null

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'80px 20px 40px' }}>

      {/* Header */}
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:56, height:56, borderRadius:16, background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', marginBottom:14 }}>
          <Trophy size={26} color="#f59e0b" strokeWidth={1.5} />
        </div>
        <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.5px', marginBottom:8 }}>Community Rankings</div>
        <div style={{ fontSize:14, color:'var(--muted)', lineHeight:1.6 }}>
          Real people, real impact. Every scan helps the planet.
        </div>
      </div>

      {/* My rank banner */}
      {me && myRank && (
        <div style={{
          background:'var(--green-bg)', border:'1px solid var(--green-bdr)',
          borderRadius:14, padding:'14px 18px', marginBottom:20,
          display:'flex', alignItems:'center', gap:14,
        }}>
          <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(34,197,94,0.15)', border:'1px solid var(--green-bdr)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Star size={18} color="var(--green)" strokeWidth={2} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:'var(--muted)', marginBottom:2 }}>Your current rank</div>
            <div style={{ fontSize:15, fontWeight:600, color:'var(--green)' }}>
              #{myRank} · {me.total_points.toLocaleString()} points · {me.co2_saved.toFixed(2)}kg CO₂ saved
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:24 }}>
        {[
          { label:'Total Participants', value: displayList.length + '+', icon: Users,  color:'var(--blue)'   },
          { label:'Points Awarded',     value: displayList.reduce((s,l)=>s+(l.total_points||0),0).toLocaleString(), icon:Zap, color:'var(--amber)' },
          { label:'CO₂ Saved',          value: displayList.reduce((s,l)=>s+(l.co2_saved||0),0).toFixed(0)+'kg', icon:Leaf, color:'var(--green)' },
        ].map(({ label, value, icon:Icon, color }) => (
          <div key={label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'14px', textAlign:'center' }}>
            <Icon size={16} color={color} strokeWidth={1.5} style={{ marginBottom:6 }} />
            <div style={{ fontSize:18, fontWeight:700, color, marginBottom:3, fontFamily:'var(--mono)' }}>{value}</div>
            <div style={{ fontSize:11, color:'var(--dim)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Top 3 podium */}
      {displayList.length >= 3 && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.1fr 1fr', gap:10, marginBottom:20, alignItems:'flex-end' }}>
          {[displayList[1], displayList[0], displayList[2]].map((entry, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3
            const ht   = rank === 1 ? 100 : rank === 2 ? 80 : 70
            const col  = rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : '#c2794a'
            return (
              <div key={entry.username} style={{ textAlign:'center' }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {entry.username}
                </div>
                <div style={{ fontSize:11, color:'var(--dim)', marginBottom:8 }}>{entry.total_points?.toLocaleString()} pts</div>
                <div style={{
                  height: ht, borderRadius:'10px 10px 0 0',
                  background:`${col}15`, border:`1px solid ${col}30`,
                  borderBottom:'none', display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <span style={{ fontSize:20, fontWeight:700, color:col, fontFamily:'var(--mono)' }}>#{rank}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full list */}
      <div>
        <div style={{ fontSize:11, color:'var(--dim)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 }}>
          Full Rankings
        </div>
        {loading ? (
          <SkeletonList count={10} />
        ) : (
          displayList.map((entry, i) => (
            <LeaderRow key={entry.username} entry={entry} rank={i+1} isMe={me?.username === entry.username} />
          ))
        )}
      </div>
    </div>
  )
}
