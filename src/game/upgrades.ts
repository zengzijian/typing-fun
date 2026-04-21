import type { UpgradeOption, GameEngineState } from './types'

export const ALL_UPGRADES: UpgradeOption[] = [
  {
    id: 'piercing',
    label: '穿透弹',
    description: '子弹命中后继续飞行，可贯穿多个敌人',
    category: 'weapon',
    apply: (s) => { s.piercing = true },
  },
  {
    id: 'chain_explosion',
    label: '连锁爆炸',
    description: '击杀敌人后，周围50px内敌人受到1点伤害',
    category: 'weapon',
    apply: (s) => { s.chainExplosion = true },
  },
  {
    id: 'rapid_fire',
    label: '急速射击',
    description: '射击动画加速30%，提升输出节奏',
    category: 'weapon',
    apply: (s) => { /* turret animation speed handled in renderer */ },
  },
  {
    id: 'shield_up',
    label: '护盾强化',
    description: '中心点最大HP +1',
    category: 'defense',
    apply: (s) => { s.maxCenterHp += 1; s.centerHp = Math.min(s.centerHp + 1, s.maxCenterHp) },
  },
  {
    id: 'slow_field',
    label: '减速磁场',
    description: '所有敌人移速降低15%',
    category: 'defense',
    apply: (s) => { s.speedMultiplier *= 0.85 },
  },
  {
    id: 'auto_turret',
    label: '自动炮台',
    description: '每10秒自动消灭距离最近的敌人',
    category: 'defense',
    apply: (s) => { s.autoTurretCooldown = 10 },
  },
  {
    id: 'word_reveal',
    label: '词语预警',
    description: '敌人出现时高亮显示完整拼音提示',
    category: 'utility',
    apply: (s) => { s.wordReveal = true },
  },
  {
    id: 'time_bonus',
    label: '时间压缩',
    description: '每关倒计时延长15秒',
    category: 'utility',
    apply: (s) => { s.timeBonusSeconds += 15 },
  },
  {
    id: 'crit_bonus',
    label: '爆击加成',
    description: '连续5次无误击杀后，下个敌人瞬间消灭',
    category: 'utility',
    apply: (s) => { s.critStreak = 5 },
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
