import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Map() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [position, setPosition] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const markersRef = useRef([]);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter = [40.7128, -74.0060]; // NYC as default
    const map = L.map(mapRef.current).setView(defaultCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when position changes
  useEffect(() => {
    if (position && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(position, 13);
      
      // Clear old markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add user location marker
      const userMarker = L.marker(position)
        .addTo(mapInstanceRef.current)
        .bindPopup('📍 You are here');
      markersRef.current.push(userMarker);
    }
  }, [position]);

  // Update facility markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove old facility markers (keep user marker)
    markersRef.current.slice(1).forEach(marker => marker.remove());
    markersRef.current = markersRef.current.slice(0, 1);

    // Add facility markers
    facilities.forEach(facility => {
      if (facility.lat && facility.lon) {
        const icon = facility.type === 'recycling' ? '♻️' : '🗑️';
        const marker = L.marker([facility.lat, facility.lon])
          .addTo(mapInstanceRef.current)
          .bindPopup(`<strong>${facility.name}</strong><br/>${icon} ${facility.type === 'recycling' ? 'Recycling Center' : 'Waste Disposal'}`);
        markersRef.current.push(marker);
      }
    });
  }, [facilities]);

  const findMyLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPosition);
        findNearbyFacilities(pos.coords.latitude, pos.coords.longitude);
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
        console.error('Geolocation error:', err);
      }
    );
  };

  const findNearbyFacilities = async (lat, lon) => {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="recycling"](around:5000,${lat},${lon});
        node["amenity"="waste_disposal"](around:5000,${lat},${lon});
        way["amenity"="recycling"](around:5000,${lat},${lon});
      );
      out center;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }

      const data = await response.json();
      
      const facilityList = data.elements
        .filter(el => (el.lat && el.lon) || el.center)
        .map(el => ({
          id: el.id,
          lat: el.lat || el.center?.lat,
          lon: el.lon || el.center?.lon,
          name: el.tags?.name || 'Recycling Facility',
          type: el.tags?.amenity
        }));
      
      setFacilities(facilityList);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Could not load nearby facilities. Please try again.');
    }
  };

  return (
    <div style={{ height: '100%' }}>
      <h2 style={{ marginBottom: '10px' }}>📍 Find Disposal Facilities</h2>
      <p style={{ marginBottom: '15px', color: 'var(--muted)' }}>
        Locate nearby recycling centers and waste disposal facilities
      </p>

      {error && (
        <div style={{ 
          padding: '12px', 
          background: 'var(--red-bg)', 
          color: 'var(--red)', 
          borderRadius: 'var(--radius-sm)',
          marginBottom: '15px',
          border: '1px solid var(--red)'
        }}>
          {error}
        </div>
      )}

      <button 
        onClick={findMyLocation}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px 20px',
          background: loading ? 'var(--surface2)' : 'var(--green)',
          color: loading ? 'var(--muted)' : 'white',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '15px',
          transition: 'all 0.2s'
        }}
      >
        {loading ? '🔄 Finding your location...' : '📍 Find Facilities Near Me'}
      </button>

      <div 
        ref={mapRef} 
        style={{ 
          height: '500px', 
          width: '100%', 
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}
      />

      {facilities.length > 0 && (
        <div style={{ 
          marginTop: '15px', 
          padding: '12px',
          background: 'var(--green-bg)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--green-bdr)',
          color: 'var(--green)'
        }}>
          ✓ Found {facilities.length} facilities nearby
        </div>
      )}
    </div>
  );
}

export default Map;
