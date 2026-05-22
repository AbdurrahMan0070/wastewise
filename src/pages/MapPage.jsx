import Map from '../components/Map'

// Simple wrapper — Map handles everything including geolocation and Overpass API
export default function MapPage() {
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100%',
      overflow:      'hidden',
    }}>
      <Map />
    </div>
  )
}
