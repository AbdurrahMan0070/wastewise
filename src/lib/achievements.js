export const ACHIEVEMENTS = [
  {
    id: 'first_scan',
    title: 'First Scan',
    desc: 'Complete your first scan',
    requirement: (stats) => stats.scans >= 1,
    color: 'var(--green)',
  },
  {
    id: 'scan_10',
    title: '10 Scans',
    desc: 'Scan 10 items correctly',
    requirement: (stats) => stats.scans >= 10,
    color: 'var(--blue)',
  },
  {
    id: 'scan_50',
    title: '50 Scans',
    desc: 'Scan 50 items correctly',
    requirement: (stats) => stats.scans >= 50,
    color: 'var(--purple)',
  },
  {
    id: 'first_tag',
    title: 'First Tag',
    desc: 'Tag an item for the community',
    requirement: (stats) => stats.tags >= 1,
    color: 'var(--amber)',
  },
  {
    id: 'co2_saver',
    title: 'CO₂ Saver',
    desc: 'Save 1kg of CO₂',
    requirement: (stats) => stats.co2 >= 1,
    color: 'var(--lime)',
  },
  {
    id: 'points_100',
    title: '100 Points',
    desc: 'Reach 100 points',
    requirement: (stats) => stats.points >= 100,
    color: 'var(--cyan)',
  },
]

export function checkNewAchievements(oldStats, newStats, unlockedIds = []) {
  const newAchievements = []
  
  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (unlockedIds.includes(achievement.id)) continue
    
    // Check if just unlocked
    const wasUnlocked = achievement.requirement(oldStats)
    const isNowUnlocked = achievement.requirement(newStats)
    
    if (!wasUnlocked && isNowUnlocked) {
      newAchievements.push(achievement)
    }
  }
  
  return newAchievements
}

export function getUnlockedAchievements(stats) {
  return ACHIEVEMENTS.filter(a => a.requirement(stats))
}
