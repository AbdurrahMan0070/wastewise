import { useEffect, useState, useRef } from 'react'
import { MapPin, RefreshCw, CheckCircle, Search, Filter } from 'lucide-react'

const TYPE_COLORS = {
  Recycling: 'var(--green)',
  'E-Waste':  'var(--purple)',
  Hazardous:  'var(--amber)',
  Compost:    'var(--lime)',
  General:    'var(--muted)',
}

function FacilityCard({ f, selected, onClick }) {
  const color = TYPE_COLORS[f.type] || 'var(--muted)'
  return (
    <div onClick={onClick} style={{
      background: selected ? 'var(--surface3)' : 'var(--surface2)',
      border: `1px solid ${selected ? color : 'var(--border)'}`,
      borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
      transition: 'all 0.15s', marginBottom: 8,
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MapPin size={15} color={color} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{f.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{f.address}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {(f.accepts || []).map(a => (
              <span key={a} style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 10,
                background: `${color}15`, color, border: `1px solid ${color}25`,
              }}>{a}</span>
            ))}
          </div>
        </div>
        <span style={{
          fontSize: 10, padding: '3px 8px', borderRadius: 10, flexShrink: 0,
          background: `${color}15`, color, border: `1px solid ${color}25`, fontWeight: 600,
        }}>{f.type}</span>
      </div>
    </div>
  )
}

export default function MapPage() {
  const [facilities, setFacilities] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [mapReady, setMapReady] = useState(false)
  const [mapInstance, setMapInstance] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const markersRef = useRef([])
  const initAttempts = useRef(0)

  // Initialize map - try multiple times if needed
  useEffect(() => {
    const initMap = () => {
      if (mapReady || !window.L || initAttempts.current > 10) return

      try {
        const L = window.L
        const map = L.map('waste-map', { 
          center: [40.7128, -74.0060],
          zoom: 12,
          zoomControl: true
        })

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map)

        setMapInstance(map)
        setMapReady(true)
        console.log('Map initialized successfully')
      } catch (err) {
        console.error('Map init error:', err)
        initAttempts.current++
      }
    }

    // Try immediately
    initMap()

    // Retry every 100ms if not ready
    const interval = setInterval(() => {
      if (!mapReady && window.L) {
        initMap()
      } else if (mapReady) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [mapReady])

  // Load facilities
  const loadFacilities = () => {
    setLoading(true)
    setError('')
    
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserLocation({ lat, lng })
        
        const query = `[out:json][timeout:15];(node["amenity"="recycling"](around:8000,${lat},${lng});node["amenity"="waste_disposal"](around:8000,${lat},${lng});way["amenity"="recycling"](around:8000,${lat},${lng}););out center 50;`

        try {
          const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
          })
          
          if (!res.ok) {
            throw new Error('API request failed')
          }

          const data = await res.json()
          
          const list = data.elements.map(el => ({
            id: el.id,
            lat: el.lat || el.center?.lat,
            lng: el.lon || el.center?.lon,
            name: el.tags?.name || 'Recycling Facility',
            type: el.tags?.amenity === 'waste_disposal' ? 'General' : 'Recycling',
            address: el.tags?.['addr:street'] || el.tags?.['addr:city'] || 'Address not available',
            accepts: ['General Waste']
          })).filter(f => f.lat && f.lng)
          
          setFacilities(list)
          setLoading(false)
          
          // Clear error if successful
          if (list.length === 0) {
            setError('No facilities found nearby. Try a different location.')
          }
        } catch (err) {
          console.error('Facility load error:', err)
          setError('Could not load facilities. Please try again.')
          setLoading(false)
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setError('Location access denied. Please enable location services.')
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    )
  }

  // Update user marker
  useEffect(() => {
    if (!mapInstance || !userLocation || !window.L) return

    const L = window.L
    mapInstance.flyTo([userLocation.lat, userLocation.lng], 13)

    const userIcon = L.divIcon({
      className: '',
      html: '<div style="width:40px;height:40px;border-radius:50%;background:#3b82f622;border:3px solid #3b82f6;display:flex;align-items:center;justify-content:center;"><div style="width:12px;height:12px;border-radius:50%;background:#3b82f6;"></div></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })
    
    const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(mapInstance)
    markersRef.current.unshift(marker)
  }, [userLocation, mapInstance])

  // Update facility markers
  useEffect(() => {
    if (!mapInstance || !window.L) return

    const L = window.L
    const userMarkerCount = userLocation ? 1 : 0
    markersRef.current.slice(userMarkerCount).forEach(m => m.remove())
    markersRef.current = markersRef.current.slice(0, userMarkerCount)

    const toShow = filter === 'All' ? facilities : facilities.filter(f => f.type === filter)

    toShow.forEach(f => {
      const color = TYPE_COLORS[f.type] || '#64748b'
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;cursor:pointer;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([f.lat, f.lng], { icon }).addTo(mapInstance)
      marker.bindPopup(`<div style="min-width:180px"><div style="font-weight:600;font-size:13px;color:#e2e8f0">${f.name}</div><div style="font-size:11px;color:#64748b;margin-top:4px">${f.address}</div></div>`)
      markersRef.current.push(marker)
    })

    if (toShow.length > 0) {
      const bounds = L.latLngBounds(toShow.map(f => [f.lat, f.lng]))
      if (userLocation) bounds.extend([userLocation.lat, userLocation.lng])
      mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }
  }, [facilities, mapInstance, filter, userLocation])

  const FILTERS = ['All', 'Recycling', 'E-Waste', 'Hazardous', 'Compost']
  const filtered = filter === 'All' ? facilities : facilities.filter(f => f.type === filter)

  return (
    <div style={{ display: 'flex', height: '100vh', paddingTop: 58 }}>
      <div style={{
        width: 320, flexShrink: 0, background: 'var(--surface)', 
        borderRight: '1px solid var(--border)', display: 'flex', 
        flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Disposal Facilities</div>
          
          {!userLocation && !loading && !error && (
            <button onClick={loadFacilities} style={{
              width: '100%', padding: '10px', background: 'var(--green)', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', marginBottom: 12, fontFamily: 'var(--font)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
              <MapPin size={14} strokeWidth={2.5} />
              Find Facilities Near Me
            </button>
          )}
          
          {loading && (
            <div style={{ padding: '10px', textAlign: 'center', color: 'var(--muted)', 
              fontSize: 11, marginBottom: 12, background: 'var(--surface2)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--border)', 
                borderTop: '2px solid var(--green)', borderRadius: '50%', 
                animation: 'spin 0.8s linear infinite' }} />
              Finding your location...
            </div>
          )}
          
          {error && (
            <div style={{ padding: '10px', background: 'var(--red-bg)', color: 'var(--red)', 
              borderRadius: 8, fontSize: 11, marginBottom: 12, border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
              <button onClick={loadFacilities} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', marginTop: 8, padding: '6px',
                background: 'var(--red)', color: 'white', border: 'none',
                borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer'
              }}>
                <RefreshCw size={12} strokeWidth={2.5} />
                Try Again
              </button>
            </div>
          )}
          
          {userLocation && !loading && !error && (
            <div style={{ padding: '8px 10px', background: 'var(--green-bg)', color: 'var(--green)', 
              borderRadius: 8, fontSize: 11, marginBottom: 12, border: '1px solid var(--green-bdr)',
              display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={12} strokeWidth={2.5} />
              Location found • {facilities.length} facilities nearby
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => {
              const color = TYPE_COLORS[f] || 'var(--muted)'
              const active = filter === f
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                  background: active ? (f === 'All' ? 'var(--green-bg)' : `${color}15`) : 'var(--surface2)',
                  border: `1px solid ${active ? (f === 'All' ? 'var(--green-bdr)' : `${color}35`) : 'var(--border)'}`,
                  color: active ? (f === 'All' ? 'var(--green)' : color) : 'var(--dim)',
                  fontFamily: 'var(--font)', fontWeight: active ? 600 : 400, transition: 'all 0.15s',
                }}>{f}</button>
              )
            })}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          {filtered.length > 0 ? (
            filtered.map(f => (
              <FacilityCard key={f.id} f={f} selected={selected === f.id} 
                onClick={() => { setSelected(f.id); mapInstance?.flyTo([f.lat, f.lng], 15) }} />
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: 'var(--muted)',
              fontSize: 12
            }}>
              {!userLocation ? (
                <>
                  <MapPin size={32} color="var(--dim)" strokeWidth={1.5} style={{ marginBottom: 10 }} />
                  <div>Click the button above to find facilities near you</div>
                </>
              ) : loading ? (
                <>
                  <div style={{ width: 32, height: 32, border: '2px solid var(--border)', 
                    borderTop: '2px solid var(--green)', borderRadius: '50%', 
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                  <div>Searching for facilities...</div>
                </>
              ) : (
                <>
                  <Search size={32} color="var(--dim)" strokeWidth={1.5} style={{ marginBottom: 10 }} />
                  <div>No {filter !== 'All' ? filter.toLowerCase() : ''} facilities found nearby</div>
                  {filter !== 'All' && (
                    <button onClick={() => setFilter('All')} style={{
                      marginTop: 12, padding: '6px 12px', background: 'var(--green)',
                      color: 'white', border: 'none', borderRadius: 6, fontSize: 11,
                      fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
                      alignItems: 'center', gap: 6
                    }}>
                      <Filter size={12} strokeWidth={2.5} />
                      Show All Types
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', 
          fontSize: 11, color: 'var(--dim)', textAlign: 'center' }}>
          {filtered.length} facilities • OpenStreetMap
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <div id="waste-map" style={{ width: '100%', height: '100%' }} />
        {!mapReady && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', 
            justifyContent: 'center', background: 'var(--surface)', flexDirection: 'column', 
            gap: 12, zIndex: 1000
          }}>
            <div style={{ width: 36, height: 36, border: '2px solid var(--border)', 
              borderTop: '2px solid var(--green)', borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite' }} />
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Loading map...</div>
          </div>
        )}
      </div>
    </div>
  )
}
