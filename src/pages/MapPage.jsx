import Map from '../components/Map'

export default function MapPage() {
  return (
    <div style={{
      position: 'fixed',
      top:    52,
      left:   0,
      right:  0,
      bottom: 62,
      overflow: 'hidden',
    }}>
      <Map />
    </div>
  )
}
