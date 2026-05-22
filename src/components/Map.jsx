import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Map() {
  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef     = useRef([]);

  const [position,   setPosition]   = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [status,     setStatus]     = useState('idle'); // idle | locating | loading | done | denied | error
  const [count,      setCount]      = useState(0);
  const [collapsed,  setCollapsed]  = useState(false); // collapses top panel after finding

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);
    mapInstanceRef.current = map;
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Invalidate map size whenever collapsed state changes — critical for mobile
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 350); // wait for CSS transition to finish
  }, [collapsed]);

  // Fly to position when set
  useEffect(() => {
    if (!position || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(position, 15, { duration: 1.2 });
    const youIcon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8],
    });
    const you = L.marker(position, { icon: youIcon }).addTo(mapInstanceRef.current);
    you.bindPopup('<b style="color:#e2e8f0;font-family:-apple-system,sans-serif">You are here</b>');
    markersRef.current.push(you);
  }, [position]);

  // Add facility markers
  useEffect(() => {
    if (!mapInstanceRef.current || facilities.length === 0) return;
    markersRef.current.slice(1).forEach(m => m.remove());
    markersRef.current = markersRef.current.slice(0, 1);

    const colors = { recycling: '#22c55e', waste_disposal: '#64748b', waste_transfer_station: '#f59e0b' };

    facilities.forEach(f => {
      if (!f.lat || !f.lon) return;
      const color = colors[f.type] || '#3b82f6';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${color}20;border:2px solid ${color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px ${color}40">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>`,
        iconSize: [32, 32], iconAnchor: [16, 16],
      });
      const marker = L.marker([f.lat, f.lon], { icon }).addTo(mapInstanceRef.current);
      marker.bindPopup(`
        <div style="font-family:-apple-system,sans-serif;min-width:160px">
          <div style="font-weight:700;font-size:13px;color:#e2e8f0;margin-bottom:4px">${f.name}</div>
          <span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${color}22;color:${color}">${f.type?.replace('_',' ') || 'Facility'}</span>
        </div>
      `);
      markersRef.current.push(marker);
    });
    setCount(facilities.length);
  }, [facilities]);

  const findNearby = async (lat, lon) => {
    setStatus('loading');
    const query = `[out:json][timeout:25];(
      node["amenity"="recycling"](around:5000,${lat},${lon});
      node["amenity"="waste_disposal"](around:5000,${lat},${lon});
      node["amenity"="waste_transfer_station"](around:5000,${lat},${lon});
      way["amenity"="recycling"](around:5000,${lat},${lon});
    );out center;`;
    try {
      const res  = await fetch('https://overpass-api.de/api/interpreter', { method:'POST', body:query });
      const data = await res.json();
      const list = data.elements.filter(el => el.lat || el.center).map(el => ({
        id:   el.id,
        lat:  el.lat || el.center?.lat,
        lon:  el.lon || el.center?.lon,
        name: el.tags?.name || el.tags?.operator || 'Recycling Facility',
        type: el.tags?.amenity,
      }));
      setFacilities(list);
      setStatus('done');
      setCollapsed(true); // <-- slide controls away, show full map
    } catch {
      setStatus('error');
    }
  };

  const handleFindMe = () => {
    if (!navigator.geolocation) { setStatus('denied'); return; }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        findNearby(pos.coords.latitude, pos.coords.longitude);
      },
      err => setStatus(err.code === 1 ? 'denied' : 'error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isLoading = status === 'locating' || status === 'loading';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', position:'relative', overflow:'hidden' }}>

      {/* Collapsible top panel */}
      <div style={{
        flexShrink: 0,
        overflow: 'hidden',
        maxHeight: collapsed ? 0 : '220px',
        transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',
        background: 'var(--bg)',
      }}>
        <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:10 }}>
          <button
            onClick={handleFindMe}
            disabled={isLoading}
            style={{
              width:'100%', padding:'14px 20px',
              background: isLoading ? 'var(--surface2)' : '#16a34a',
              color: isLoading ? 'var(--muted)' : 'white',
              border:'none', borderRadius:12,
              fontSize:15, fontWeight:600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              fontFamily:'var(--font)', transition:'background 0.2s',
            }}
          >
            {isLoading ? (
              <>
                <div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
                {status === 'locating' ? 'Getting your location...' : 'Finding facilities...'}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Find Facilities Near Me
              </>
            )}
          </button>

          {status === 'denied' && (
            <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#f59e0b', lineHeight:1.5 }}>
              <strong>Location access denied.</strong> Tap the lock icon in your browser → Site settings → Location → Allow. Then try again.
            </div>
          )}
          {status === 'error' && (
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#ef4444' }}>
              Could not load facilities. Check your connection and try again.
            </div>
          )}
          {status === 'idle' && (
            <div style={{ fontSize:12, color:'var(--dim)', textAlign:'center' }}>
              Tap the button to find nearby recycling and disposal centres
            </div>
          )}
        </div>
      </div>

      {/* Map — takes all remaining space */}
      <div style={{ flex:1, position:'relative', minHeight:0 }}>
        <div ref={mapRef} style={{ width:'100%', height:'100%' }} />

        {/* Floating pill — shows when collapsed, tap to show controls again */}
        {collapsed && (
          <div style={{
            position:'absolute', top:12, left:'50%', transform:'translateX(-50%)',
            zIndex:1000, display:'flex', gap:8,
          }}>
            <div style={{
              background:'rgba(5,5,8,0.85)', backdropFilter:'blur(12px)',
              border:'1px solid var(--border)', borderRadius:20,
              padding:'7px 14px', fontSize:12, color:'var(--green)',
              display:'flex', alignItems:'center', gap:6, fontWeight:600,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {count} facilities found
            </div>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background:'rgba(5,5,8,0.85)', backdropFilter:'blur(12px)',
                border:'1px solid var(--border)', borderRadius:20,
                padding:'7px 14px', fontSize:12, color:'var(--muted)',
                cursor:'pointer', fontFamily:'var(--font)', fontWeight:500,
                display:'flex', alignItems:'center', gap:5,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Search again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;
