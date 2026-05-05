import type { SoundEvent } from './audio'

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'WAVE_CLEAR' | 'UPGRADE' | 'GAME_OVER' | 'VICTORY'

export type EnemyType = 'infantry' | 'tank' | 'speeder' | 'elite' | 'boss'

export type Language = 'zh' | 'en'

export interface Enemy {
  id: number
  x: number
  y: number
  type: EnemyType
  word: string        // display text (chinese or english)
  target: string      // what user must type (pinyin or english)
  typed: string       // what user has typed so far
  hp: number
  maxHp: number
  speed: number
  angle: number       // angle toward center
  size: number
  color: string
  glowColor: string
  dead: boolean
  exploding: boolean
  explosionTimer: number
  // path system
  waypoints?: { x: number; y: number }[]
  waypointIndex?: number
  // freeze system
  frozen?: boolean
  frozenTimer?: number
}

export interface Projectile {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
  color: string
  done: boolean
  progress: number    // 0..1
}

export interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number        // 0..1 remaining
  color: string
  size: number
}

export interface Turret {
  x: number
  y: number
  angle: number       // current rotation angle
  targetAngle: number
  flashTimer: number  // muzzle flash duration
}

export interface UpgradeOption {
  id: string
  nameKey: string
  descKey: string
  category: 'weapon' | 'defense' | 'utility'
  apply: (state: GameEngineState) => void
}

export interface GameEngineState {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  gameState: GameState
  language: Language
  level: number
  wave: number
  totalWaves: number
  timer: number           // seconds remaining
  score: number
  combo: number
  maxCombo: number
  centerHp: number
  maxCenterHp: number
  enemies: Enemy[]
  projectiles: Projectile[]
  particles: Particle[]
  turret: Turret
  inputBuffer: string
  activeEnemyId: number | null
  lastTime: number
  rafId: number | null
  spawnQueue: SpawnEntry[]
  nextSpawnTime: number
  upgrades: string[]      // collected upgrade ids
  upgradeOptions: UpgradeOption[]
  upgradeInput: string
  // upgrade modifiers
  speedMultiplier: number
  autoTurretCooldown: number
  chainExplosion: boolean
  piercing: boolean
  wordReveal: boolean
  critStreak: number      // consecutive kills without mistake for crit
  critStreakCount: number
  timeBonusSeconds: number
  // wave progress tracking
  waveEnemyTotal: number
  // area bomb
  areaBombCooldown: number
  // score surge upgrade (8 kill streak → next 5 kills ×3)
  scoreSurgeStreak: number
  scoreSurgeKills: number
  // feedback events (consumed each frame by MechGame)
  pendingEvents: SoundEvent[]
  pendingShake: number    // screen shake intensity (0 = none)
}

export interface SpawnEntry {
  time: number   // seconds from wave start when this enemy spawns
  type: EnemyType
}

export interface LevelConfig {
  level: number
  waves: number
  duration: number      // seconds per wave
  speedMultiplier: number
  enemyTypes: EnemyType[]
  spawnInterval: number // seconds between spawns
  maxEnemies: number
  hasBoss: boolean
}

export type { SoundEvent }
