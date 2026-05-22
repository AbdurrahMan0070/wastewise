// All user state lives in localStorage — no auth needed, works forever, zero cost

const KEY = 'wastewise_user'

export function getUser() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

export function createUser(username, city) {
  const user = {
    id:            crypto.randomUUID(),
    username:      username.trim(),
    city:          city || 'Unknown',
    total_points:  0,
    items_scanned: 0,
    items_tagged:  0,
    co2_saved:     0,
    joined:        new Date().toISOString(),
  }
  localStorage.setItem(KEY, JSON.stringify(user))
  return user
}

export function updateUser(updates) {
  const user = getUser()
  if (!user) return null
  const updated = { ...user, ...updates }
  localStorage.setItem(KEY, JSON.stringify(updated))
  return updated
}

export function addPoints(points, co2 = 0) {
  const user = getUser()
  if (!user) return null
  return updateUser({
    total_points:  user.total_points  + points,
    items_scanned: user.items_scanned + 1,
    co2_saved:     +(user.co2_saved   + co2).toFixed(3),
  })
}

export function addTagPoints() {
  const user = getUser()
  if (!user) return null
  return updateUser({
    total_points: user.total_points + 5,
    items_tagged: user.items_tagged + 1,
  })
}

export function clearUser() {
  localStorage.removeItem(KEY)
}
