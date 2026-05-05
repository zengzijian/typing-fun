import type { UpgradeOption } from './types'

export const ALL_UPGRADES: UpgradeOption[] = [
  {
    id: 'piercing',
    nameKey: 'upgrades.piercing.name',
    descKey: 'upgrades.piercing.desc',
    category: 'weapon',
    apply: (s) => { s.piercing = true },
  },
  {
    id: 'chain_explosion',
    nameKey: 'upgrades.chainExplosion.name',
    descKey: 'upgrades.chainExplosion.desc',
    category: 'weapon',
    apply: (s) => { s.chainExplosion = true },
  },
  {
    id: 'rapid_fire',
    nameKey: 'upgrades.rapidFire.name',
    descKey: 'upgrades.rapidFire.desc',
    category: 'weapon',
    apply: (_s) => { /* turret animation speed handled in renderer */ },
  },
  {
    id: 'shield_up',
    nameKey: 'upgrades.shieldUp.name',
    descKey: 'upgrades.shieldUp.desc',
    category: 'defense',
    apply: (s) => { s.maxCenterHp += 1; s.centerHp = Math.min(s.centerHp + 1, s.maxCenterHp) },
  },
  {
    id: 'slow_field',
    nameKey: 'upgrades.slowField.name',
    descKey: 'upgrades.slowField.desc',
    category: 'defense',
    apply: (s) => { s.speedMultiplier *= 0.85 },
  },
  {
    id: 'auto_turret',
    nameKey: 'upgrades.autoTurret.name',
    descKey: 'upgrades.autoTurret.desc',
    category: 'defense',
    apply: (s) => { s.autoTurretCooldown = 10 },
  },
  {
    id: 'word_reveal',
    nameKey: 'upgrades.wordReveal.name',
    descKey: 'upgrades.wordReveal.desc',
    category: 'utility',
    apply: (s) => { s.wordReveal = true },
  },
  {
    id: 'time_bonus',
    nameKey: 'upgrades.timeBonus.name',
    descKey: 'upgrades.timeBonus.desc',
    category: 'utility',
    apply: (s) => { s.timeBonusSeconds += 15 },
  },
  {
    id: 'crit_bonus',
    nameKey: 'upgrades.critBonus.name',
    descKey: 'upgrades.critBonus.desc',
    category: 'utility',
    apply: (s) => { s.critStreak = 5 },
  },
  {
    id: 'area_bomb',
    nameKey: 'upgrades.areaBomb.name',
    descKey: 'upgrades.areaBomb.desc',
    category: 'weapon',
    apply: (s) => { s.areaBombCooldown = 0 },
  },
  {
    id: 'word_freeze',
    nameKey: 'upgrades.wordFreeze.name',
    descKey: 'upgrades.wordFreeze.desc',
    category: 'weapon',
    apply: (_s) => { /* effect handled in killEnemy */ },
  },
  {
    id: 'score_surge',
    nameKey: 'upgrades.scoreSurge.name',
    descKey: 'upgrades.scoreSurge.desc',
    category: 'utility',
    apply: (_s) => { /* effect handled in killEnemy */ },
  },
]

export function pickUpgradeOptions(current: string[]): UpgradeOption[] {
  const available = ALL_UPGRADES.filter(u => !current.includes(u.id) || ['slow_field', 'time_bonus', 'shield_up'].includes(u.id))
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'weapon': return '#ef4444'
    case 'defense': return '#3b82f6'
    case 'utility': return '#a855f7'
    default: return '#94a3b8'
  }
}
