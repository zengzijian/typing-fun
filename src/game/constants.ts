import type { LevelConfig } from './types'

export const CANVAS_WIDTH = 900
export const CANVAS_HEIGHT = 700
export const CENTER_X = CANVAS_WIDTH / 2
export const CENTER_Y = CANVAS_HEIGHT / 2
export const CENTER_RADIUS = 36

export const TURRET_BARREL_LENGTH = 28
export const TURRET_BODY_RADIUS = 18

export const COLORS = {
  bg: '#0a0d1a',
  grid: '#0f1a2e',
  gridLine: '#1a2a4a',
  center: '#00e5ff',
  centerGlow: '#00e5ff44',
  turretBody: '#1e3a5f',
  turretBarrel: '#2dd4bf',
  hud: '#94a3b8',
  hudBright: '#e2e8f0',
  comboLow: '#ffffff',
  comboMid: '#fbbf24',
  comboHigh: '#f97316',
  comboCrit: '#ef4444',
  enemies: {
    infantry: { body: '#22c55e', glow: '#4ade8088' },
    tank: { body: '#3b82f6', glow: '#60a5fa88' },
    speeder: { body: '#f59e0b', glow: '#fbbf2488' },
    elite: { body: '#a855f7', glow: '#c084fc88' },
    boss: { body: '#ef4444', glow: '#f8717188' },
  },
  projectile: {
    normal: '#00e5ff',
    mid: '#fbbf24',
    high: '#f97316',
    crit: '#ef4444',
  },
} as const

export const LEVELS: LevelConfig[] = [
  { level: 1, waves: 2, duration: 60, speedMultiplier: 0.5, enemyTypes: ['infantry'], spawnInterval: 4, maxEnemies: 6, hasBoss: false },
  { level: 2, waves: 2, duration: 60, speedMultiplier: 0.6, enemyTypes: ['infantry', 'speeder'], spawnInterval: 3.5, maxEnemies: 8, hasBoss: false },
  { level: 3, waves: 3, duration: 60, speedMultiplier: 0.7, enemyTypes: ['infantry', 'speeder', 'tank'], spawnInterval: 3, maxEnemies: 10, hasBoss: false },
  { level: 4, waves: 3, duration: 60, speedMultiplier: 0.8, enemyTypes: ['infantry', 'speeder', 'tank'], spawnInterval: 2.5, maxEnemies: 12, hasBoss: false },
  { level: 5, waves: 3, duration: 90, speedMultiplier: 0.9, enemyTypes: ['infantry', 'speeder', 'tank', 'elite'], spawnInterval: 2.5, maxEnemies: 12, hasBoss: false },
  { level: 6, waves: 4, duration: 90, speedMultiplier: 1.0, enemyTypes: ['infantry', 'speeder', 'tank', 'elite'], spawnInterval: 2, maxEnemies: 15, hasBoss: false },
  { level: 7, waves: 4, duration: 90, speedMultiplier: 1.1, enemyTypes: ['speeder', 'tank', 'elite'], spawnInterval: 2, maxEnemies: 15, hasBoss: false },
  { level: 8, waves: 4, duration: 90, speedMultiplier: 1.2, enemyTypes: ['tank', 'elite'], spawnInterval: 1.8, maxEnemies: 18, hasBoss: false },
  { level: 9, waves: 4, duration: 90, speedMultiplier: 1.3, enemyTypes: ['infantry', 'speeder', 'tank', 'elite'], spawnInterval: 1.5, maxEnemies: 20, hasBoss: true },
  { level: 10, waves: 5, duration: 120, speedMultiplier: 1.5, enemyTypes: ['infantry', 'speeder', 'tank', 'elite'], spawnInterval: 1.2, maxEnemies: 25, hasBoss: true },
]

export const ENEMY_BASE_SPEED = 38  // pixels per second
export const ENEMY_SIZES: Record<string, number> = {
  infantry: 14,
  tank: 20,
  speeder: 10,
  elite: 16,
  boss: 32,
}
