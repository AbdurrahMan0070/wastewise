import { useState, useRef, useEffect } from 'react'
import { Search, X, AlertTriangle, TrendingUp, Clock, Camera, XCircle, ArrowLeft, RotateCcw } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabase'
import { CATEGORIES, DEMO_ITEMS } from '../lib/data'
import { useToast } from '../components/ToastContainer'
import { checkNewAchievements } from '../lib/achievements'
import AchievementPopup from '../components/AchievementPopup'
import { SkeletonCard } from '../components/Skeleton'

const POPULAR_ITEMS = [
  'Plastic Bottle', 'Glass Bottle', 'Aluminum Can', 'Cardboard Box',
  'Battery', 'Newspaper', 'Food Waste', 'Electronics'
]

export default function ScannerNew({ user, onUserUpdate }) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentScans, setRecentScans] = useState([])
  const [achievement, setAchievement] = useState(null)
  const [scanning, setScanning] = useState(false)
  const inputRef = useRef(null)
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    inputRef.current?.focus()
    loadRecentScans()
    
    // Cleanup scanner on unmount
    return () => {
      stopScanner()
    }
  }, [])

  useEffect(() => {
    if (query.length >= 2) {
      loadSuggestions(query)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const loadRecentScans = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('scans')
        .select('item_name, category, created_at')
        .eq('username', user.username)
        .order('created_at', { ascending: false })
        .limit(5)
      if (data) setRecentScans(data)
    } catch (e) {}
  }

  const loadSuggestions = async (term) => {
    try {
      const { data } = await supabase
        .from('items')
        .select('name')
        .ilike('name', `%${term}%`)
        .limit(5)
      
      const names = data?.map(d => d.name) || []
      const popular = POPULAR_ITEMS.filter(p => 
        p.toLowerCase().includes(term.toLowerCase())
      )
      
      setSuggestions([...new Set([...popular, ...names])].slice(0, 5))
      setShowSuggestions(true)
    } catch (e) {
      setSuggestions(POPULAR_ITEMS.filter(p => 
        p.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 5))
      setShowSuggestions(true)
    }
  }

  const startScanner = async () => {
    try {
      setScanning(true)
      setResult(null)
      
      const html5QrCode = new Html5Qrcode("barcode-reader")
      html5QrCodeRef.current = html5QrCode
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Barcode scanned successfully
          toast('Barcode detected! Searching...', 'info')
          stopScanner()
          setQuery(decodedText)
          search(decodedText)
        },
        (errorMessage) => {
          // Scanning in progress (ignore errors)
        }
      )
    } catch (err) {
      console.error('Scanner error:', err)
      toast('Camera access denied or not available', 'error')
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (e) {}
      html5QrCodeRef.current = null
    }
    setScanning(false)
  }

  const resetScanner = () => {
    setResult(null)
    setQuery('')
    setLoading(false)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const search = async (searchTerm) => {
    const term = (searchTerm || query).trim()
    if (!term) return
    
    setLoading(true)
    setResult(null)
    setShowSuggestions(false)

    try {
      // Search items table
      const { data: itemData } = await supabase
        .from('items')
        .select('*')
        .ilike('name', `%${term}%`)
        .limit(1)
        .single()
      
      if (itemData) {
        setResult({ ...itemData, found: true })
        handleScanSuccess(itemData)
        setLoading(false)
        return
      }
    } catch (e) {}

    try {
      // Search products table
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .or(`product_name.ilike.%${term}%,barcode.eq.${term}`)
        .limit(1)
        .single()
      
      if (prodData) {
        const item = {
          name: prodData.product_name,
          category: prodData.category.charAt(0).toUpperCase() + prodData.category.slice(1),
          barcode: prodData.barcode,
          disposal_method: getDisposalMethod(prodData.category),
          instructions: prodData.notes || getDefaultInstructions(prodData.category),
          co2_saved: 0.1,
          verified: true,
          found: true
        }
        setResult(item)
        handleScanSuccess(item)
        setLoading(false)
        return
      }
    } catch (e) {}

    // Search local DEMO_ITEMS as fallback
    const demoItem = DEMO_ITEMS.find(item => 
      item.name.toLowerCase().includes(term.toLowerCase()) ||
      item.barcode === term
    )
    
    if (demoItem) {
      const item = {
        name: demoItem.name,
        category: demoItem.category,
        barcode: demoItem.barcode,
        disposal_method: demoItem.disposal_method,
        instructions: demoItem.instructions,
        co2_saved: demoItem.co2_saved,
        verified: demoItem.verified,
        found: true
      }
      setResult(item)
      handleScanSuccess(item)
      setLoading(false)
      return
    }

    setResult({ name: term, found: false })
    setLoading(false)
    toast('Item not found in our database', 'info')
  }

  const handleScanSuccess = (item) => {
    if (!user) return

    const oldStats = {
      scans: user.items_scanned || 0,
      tags: user.items_tagged || 0,
      points: user.total_points || 0,
      co2: user.co2_saved || 0,
    }

    const newStats = {
      ...oldStats,
      scans: oldStats.scans + 1,
      points: oldStats.points + 1,
      co2: oldStats.co2 + (item.co2_saved || 0.1),
    }

    // Check for new achievements
    const unlockedIds = JSON.parse(localStorage.getItem('unlocked_achievements') || '[]')
    const newAchievements = checkNewAchievements(oldStats, newStats, unlockedIds)
    
    if (newAchievements.length > 0) {
      const newIds = [...unlockedIds, ...newAchievements.map(a => a.id)]
      localStorage.setItem('unlocked_achievements', JSON.stringify(newIds))
      setAchievement(newAchievements[0])
    }

    // Update user
    const updated = {
      ...user,
      items_scanned: newStats.scans,
      total_points: newStats.points,
      co2_saved: newStats.co2,
    }
    onUserUpdate(updated)

    // Save to database
    if (supabase) {
      supabase.from('scans').insert({
        username: user.username,
        item_name: item.name,
        category: item.category,
        points: 1,
        co2_saved: item.co2_saved || 0.1,
        city: user.city || 'Unknown',
      }).then(() => {})

      supabase.from('users').upsert({
        username: user.username,
        city: user.city,
        total_points: newStats.points,
        items_scanned: newStats.scans,
        co2_saved: newStats.co2,
      }, { onConflict: 'username' }).then(() => {})
    }

    toast(`Scanned ${item.name}! +1 point`, 'success')
    loadRecentScans()
  }

  const getDisposalMethod = (category) => {
    const methods = {
      recyclable: 'Recycling Bin',
      trash: 'General Waste',
      hazardous: 'Hazardous Waste Facility',
      compost: 'Compost Bin'
    }
    return methods[category] || 'General Waste'
  }

  const getDefaultInstructions = (category) => {
    const instructions = {
      recyclable: 'Rinse clean and place in recycling bin.',
      trash: 'Place in general waste bin.',
      hazardous: 'Take to hazardous waste facility.',
      compost: 'Place in compost bin.'
    }
    return instructions[category] || 'Dispose according to local guidelines.'
  }

  const cat = result?.found ? (CATEGORIES[result.category] || CATEGORIES['General Waste']) : null

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '80px 20px 40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8 }}>
          What are you disposing?
        </div>
        <div style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6 }}>
          Search any item to learn how to dispose of it correctly
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={18} color="var(--dim)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder="Search item name or barcode..."
          style={{
            width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 14, padding: '14px 52px 14px 48px',
            color: 'var(--text)', fontSize: 15, outline: 'none', fontFamily: 'var(--font)',
            transition: 'border-color 0.15s',
          }}
          onFocusCapture={e => e.target.style.borderColor = 'var(--green)'}
          onBlur={e => { e.target.style.borderColor = 'var(--border2)'; setTimeout(() => setShowSuggestions(false), 200) }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResult(null); inputRef.current?.focus() }} style={{
            position: 'absolute', right: 50, top: '50%', transform: 'translateY(-50%)',
            background: 'transparent', border: 'none', color: 'var(--dim)', cursor: 'pointer', padding: 4,
          }}>
            <X size={16} strokeWidth={2} />
          </button>
        )}
        <button onClick={() => search()} disabled={loading} style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          background: loading ? 'var(--surface2)' : 'var(--green)', border: 'none', borderRadius: 9, padding: '8px 12px',
          color: loading ? 'var(--dim)' : '#fff', fontSize: 12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)',
        }}>
          {loading ? 'Searching...' : 'Search'}
        </button>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 100,
          }}>
            {suggestions.map((sug, i) => (
              <div
                key={i}
                onClick={() => { setQuery(sug); search(sug) }}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Search size={14} color="var(--dim)" strokeWidth={2} />
                <span style={{ fontSize: 14, color: 'var(--text)' }}>{sug}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barcode Scanner Button */}
      {!scanning && !result && (
        <button onClick={startScanner} style={{
          width: '100%',
          background: 'var(--surface)',
          border: '2px dashed var(--border2)',
          borderRadius: 14,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          cursor: 'pointer',
          marginBottom: 20,
          transition: 'all 0.2s',
          fontFamily: 'var(--font)',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--green)'
            e.currentTarget.style.background = 'var(--green-bg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border2)'
            e.currentTarget.style.background = 'var(--surface)'
          }}
        >
          <Camera size={24} color="var(--green)" strokeWidth={2} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
              Scan Barcode with Camera
            </div>
            <div style={{ fontSize: 12, color: 'var(--dim)' }}>
              Point your camera at any product barcode
            </div>
          </div>
        </button>
      )}

      {/* Camera Scanner View */}
      {scanning && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          <div style={{
            background: 'var(--surface2)',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Camera size={18} color="var(--green)" strokeWidth={2} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                Scanning for barcode...
              </span>
            </div>
            <button onClick={stopScanner} style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--dim)',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <XCircle size={20} strokeWidth={2} />
            </button>
          </div>
          <div id="barcode-reader" style={{ width: '100%' }} />
          <div style={{
            padding: '14px 16px',
            background: 'var(--surface2)',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              Position the barcode within the frame. The scanner will automatically detect it.
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <SkeletonCard />}

      {/* Result */}
      {result && result.found && !loading && cat && (
        <div className="scale-in" style={{
          background: 'var(--surface)', border: `1px solid ${cat.border}`,
          borderRadius: 16, overflow: 'hidden', marginTop: 20,
        }}>
          <div style={{
            background: cat.bg, padding: '20px', borderBottom: `1px solid ${cat.border}`,
          }}>
            <div style={{
              display: 'inline-block', padding: '4px 12px', background: cat.bg,
              border: `1px solid ${cat.border}`, borderRadius: 20, fontSize: 12,
              fontWeight: 600, color: cat.color, marginBottom: 10,
            }}>
              {result.category}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px' }}>{result.name}</div>
          </div>

          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Disposal Method</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: cat.color }}>{result.disposal_method}</div>
          </div>

          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Instructions</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>{result.instructions}</div>
          </div>

          <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>CO₂ Saved</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--mono)' }}>
                {result.co2_saved > 0 ? `${result.co2_saved} kg` : '—'}
              </div>
            </div>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Points</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--amber)', fontFamily: 'var(--mono)' }}>+1 pt</div>
            </div>
          </div>
        </div>
      )}

      {/* Not found */}
      {result && !result.found && !loading && (
        <div className="scale-in" style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 16, padding: 24, marginTop: 20, textAlign: 'center',
        }}>
          <AlertTriangle size={28} color="var(--amber)" strokeWidth={1.5} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Item not found yet</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            This item isn't in our database yet. Help the community by tagging it!
          </div>
        </div>
      )}

      {/* Scan Another Item Button */}
      {result && !loading && (
        <button onClick={resetScanner} style={{
          width: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          cursor: 'pointer',
          marginTop: 16,
          transition: 'all 0.2s',
          fontFamily: 'var(--font)',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--green)'
            e.currentTarget.style.background = 'var(--green-bg)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.background = 'var(--surface)'
          }}
        >
          <RotateCcw size={18} color="var(--green)" strokeWidth={2} />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            Scan Another Item
          </span>
        </button>
      )}

      {/* Recent scans */}
      {!result && !loading && recentScans.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Clock size={16} color="var(--dim)" strokeWidth={2} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Recent Scans</div>
          </div>
          {recentScans.map((scan, i) => {
            const scanCat = CATEGORIES[scan.category] || CATEGORIES['General Waste']
            return (
              <div key={i} onClick={() => { setQuery(scan.item_name); search(scan.item_name) }} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 12px', marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = scanCat.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: scanCat.bg,
                  border: `1px solid ${scanCat.border}`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <TrendingUp size={14} color={scanCat.color} strokeWidth={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{scan.item_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--dim)' }}>{scan.category}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick searches */}
      {!result && !loading && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Popular Items</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {POPULAR_ITEMS.map(item => (
              <button key={item} onClick={() => { setQuery(item); search(item) }} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '6px 14px', fontSize: 12,
                color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-bdr)'; e.currentTarget.style.color = 'var(--green)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Achievement popup */}
      {achievement && (
        <AchievementPopup
          achievement={achievement}
          onClose={() => setAchievement(null)}
        />
      )}
    </div>
  )
}
