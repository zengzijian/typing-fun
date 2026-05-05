import type { GameEngineState, Language, SoundEvent } from './types'
import { CENTER_X, CENTER_Y, CENTER_RADIUS, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants'
import { createTurret, updateTurret, aimTurret, fireTurret, updateProjectiles, drawTurret, drawProjectiles } from './turret'
import { createEnemy, updateEnemies, drawEnemy } from './enemies'
import { createExplosion, updateParticles, drawParticles } from './particles'
import { drawBackground, drawCenter, drawHUD } from './renderer'
import { matchesPrefix, isComplete, resetWordSystem } from './wordSystem'
import { getLevelConfig, buildSpawnSchedule } from './waves'
import { pickUpgradeOptions } from './upgrades'

type StateChangeCallback = (state: GameEngineState) => void

const EMPTY_EVENTS: SoundEvent[] = []

function baseState(canvas: HTMLCanvasElement, lang: Language): Omit<GameEngineState, 'gameState' | 'level' | 'wave' | 'totalWaves' | 'timer' | 'enemies' | 'spawnQueue' | 'waveEnemyTotal'> {
  const ctx = canvas.getContext('2d')!
  return {
    canvas, ctx,
    language: lang,
    score: 0,
    combo: 0,
    maxCombo: 0,
    centerHp: 3,
    maxCenterHp: 3,
    projectiles: [],
    particles: [],
    turret: createTurret(),
    inputBuffer: '',
    activeEnemyId: null,
    lastTime: 0,
    rafId: null,
    nextSpawnTime: 0,
    upgrades: [],
    upgradeOptions: [],
    upgradeInput: '',
    speedMultiplier: 1,
    autoTurretCooldown: 0,
    chainExplosion: false,
    piercing: false,
    wordReveal: false,
    critStreak: 0,
    critStreakCount: 0,
    timeBonusSeconds: 0,
    areaBombCooldown: 0,
    scoreSurgeStreak: 0,
    scoreSurgeKills: 0,
    pendingEvents: EMPTY_EVENTS,
    pendingShake: 0,
  }
}

export function createInitialState(canvas: HTMLCanvasElement, lang: Language): GameEngineState {
  return {
    ...baseState(canvas, lang),
    gameState: 'MENU',
    level: 1,
    wave: 1,
    totalWaves: 2,
    timer: 60,
    enemies: [],
    spawnQueue: [],
    waveEnemyTotal: 0,
  }
}

export function startGame(state: GameEngineState): GameEngineState {
  resetWordSystem()
  const config = getLevelConfig(1)
  const schedule = buildSpawnSchedule(config, 1)
  return {
    ...state,
    ...baseState(state.canvas, state.language),
    language: state.language,
    gameState: 'PLAYING',
    level: 1,
    wave: 1,
    totalWaves: config.waves,
    timer: config.duration,
    enemies: [],
    spawnQueue: schedule,
    waveEnemyTotal: schedule.length,
  }
}

export function startLevel(state: GameEngineState): GameEngineState {
  const config = getLevelConfig(state.level)
  const schedule = buildSpawnSchedule(config, state.wave)
  return {
    ...state,
    gameState: 'PLAYING',
    timer: config.duration + state.timeBonusSeconds,
    totalWaves: config.waves,
    enemies: [],
    projectiles: [],
    particles: [],
    spawnQueue: schedule,
    nextSpawnTime: 0,
    inputBuffer: '',
    activeEnemyId: null,
    turret: createTurret(),
    waveEnemyTotal: schedule.length,
    pendingEvents: EMPTY_EVENTS,
    pendingShake: 0,
  }
}

let autoTurretTimer = 10
let areaBombTimer = 0

export function gameLoop(
  state: GameEngineState,
  timestamp: number,
  onStateChange: StateChangeCallback,
): GameEngineState {
  if (state.gameState !== 'PLAYING') return state

  const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05)
  let s: GameEngineState = { ...state, lastTime: timestamp, pendingEvents: EMPTY_EVENTS, pendingShake: 0 }

  // area bomb cooldown
  if (s.upgrades.includes('area_bomb') && areaBombTimer > 0) {
    areaBombTimer = Math.max(0, areaBombTimer - dt)
    s.areaBombCooldown = areaBombTimer
  }

  // spawn enemies
  s.nextSpawnTime = (s.nextSpawnTime ?? 0) - dt
  if (s.spawnQueue.length > 0 && s.nextSpawnTime <= 0) {
    const entry = s.spawnQueue[0]
    const config = getLevelConfig(s.level)
    const activeCount = s.enemies.filter(e => !e.dead).length
    if (activeCount < 20) {
      const newEnemy = createEnemy(entry.type, s.language, config.speedMultiplier * s.speedMultiplier)
      s.enemies = [...s.enemies, newEnemy]
      s.spawnQueue = s.spawnQueue.slice(1)
      s.nextSpawnTime = config.spawnInterval * (0.8 + Math.random() * 0.4)
    }
  }

  // auto turret
  if (s.upgrades.includes('auto_turret')) {
    autoTurretTimer -= dt
    if (autoTurretTimer <= 0) {
      autoTurretTimer = 10
      const living = s.enemies.filter(e => !e.dead)
      if (living.length > 0) {
        let closest = living[0]
        let minDist = Infinity
        for (const e of living) {
          const d = Math.hypot(e.x - CENTER_X, e.y - CENTER_Y)
          if (d < minDist) { minDist = d; closest = e }
        }
        s.enemies = s.enemies.map(e => e.id === closest.id ? { ...e, dead: true } : e)
        s.particles = [...s.particles, ...createExplosion(closest.x, closest.y, closest.glowColor, 16)]
      }
    }
  }

  // update entities
  s.enemies = updateEnemies(s.enemies, dt)
  s.projectiles = updateProjectiles(s.projectiles, dt)
  s.particles = updateParticles(s.particles, dt)

  // check enemies reached center
  for (const e of s.enemies) {
    if (!e.dead) {
      const dist = Math.hypot(e.x - CENTER_X, e.y - CENTER_Y)
      if (dist <= CENTER_RADIUS + e.size) {
        s.enemies = s.enemies.map(en => en.id === e.id ? { ...en, dead: true } : en)
        s.centerHp = s.centerHp - 1
        s.combo = 0
        s.scoreSurgeStreak = 0
        s.particles = [...s.particles, ...createExplosion(CENTER_X, CENTER_Y, '#ef444488', 8)]
        const shakeIntensity = e.type === 'boss' ? 10 : 4
        s.pendingEvents = [...s.pendingEvents, 'center_hit']
        s.pendingShake = Math.max(s.pendingShake, shakeIntensity)
        if (s.centerHp <= 0) {
          const final = { ...s, gameState: 'GAME_OVER' as const, pendingEvents: [...s.pendingEvents, 'game_over' as const], pendingShake: 12 }
          onStateChange(final)
          return final
        }
      }
    }
  }

  // aim turret at active enemy or nearest
  const living = s.enemies.filter(e => !e.dead)
  const active = living.find(e => e.id === s.activeEnemyId) ?? living.reduce<typeof living[0] | null>((closest, e) => {
    if (!closest) return e
    return Math.hypot(e.x - CENTER_X, e.y - CENTER_Y) < Math.hypot(closest.x - CENTER_X, closest.y - CENTER_Y) ? e : closest
  }, null)

  if (active) {
    s.turret = aimTurret(s.turret, active.x, active.y)
  }
  s.turret = updateTurret(s.turret, dt)

  // countdown timer
  s.timer = s.timer - dt
  if (s.timer <= 0) {
    const config = getLevelConfig(s.level)
    if (s.wave >= config.waves) {
      const options = pickUpgradeOptions(s.upgrades)
      const next = { ...s, gameState: 'UPGRADE' as const, upgradeOptions: options, upgradeInput: '', pendingEvents: [...s.pendingEvents, 'upgrade'] as SoundEvent[] }
      onStateChange(next)
      return next
    } else {
      const nextWave = s.wave + 1
      const nextSchedule = buildSpawnSchedule(config, nextWave)
      s = { ...s, wave: nextWave, timer: config.duration + s.timeBonusSeconds, enemies: [], spawnQueue: nextSchedule, nextSpawnTime: 0, inputBuffer: '', activeEnemyId: null, waveEnemyTotal: nextSchedule.length }
      onStateChange({ ...s, gameState: 'WAVE_CLEAR' })
      return { ...s, gameState: 'WAVE_CLEAR' }
    }
  }

  // render
  render(s)

  return s
}

function render(s: GameEngineState) {
  const { ctx } = s
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  drawBackground(ctx)
  drawCenter(ctx, s.centerHp, s.maxCenterHp)
  drawParticles(ctx, s.particles)
  drawProjectiles(ctx, s.projectiles)
  for (const e of s.enemies) {
    if (!e.dead) drawEnemy(ctx, e, e.id === s.activeEnemyId)
  }
  drawTurret(ctx, s.turret)
  drawHUD(ctx, s)
}

export function renderStatic(s: GameEngineState) {
  render(s)
}

export function handleKeyInput(state: GameEngineState, key: string): GameEngineState {
  if (state.gameState !== 'PLAYING') return state

  if (key === 'Escape') return { ...state, gameState: 'PAUSED' }

  // area bomb trigger
  if (key === 'Tab' && state.upgrades.includes('area_bomb') && areaBombTimer <= 0) {
    areaBombTimer = 30
    let s = { ...state, areaBombCooldown: 30, pendingEvents: [...state.pendingEvents, 'area_bomb'] as SoundEvent[], pendingShake: Math.max(state.pendingShake, 6) }
    const BOMB_RADIUS = 220
    s.enemies = s.enemies.map(e => {
      if (e.dead) return e
      const dist = Math.hypot(e.x - CENTER_X, e.y - CENTER_Y)
      if (dist <= BOMB_RADIUS) {
        const newHp = e.hp - 1
        if (newHp <= 0) {
          s.particles = [...s.particles, ...createExplosion(e.x, e.y, e.glowColor, 14)]
          return { ...e, dead: true }
        }
        return { ...e, hp: newHp }
      }
      return e
    })
    s.particles = [...s.particles, ...createExplosion(CENTER_X, CENTER_Y, '#f97316aa', 32)]
    return s
  }

  let s = { ...state, pendingEvents: EMPTY_EVENTS }

  if (key === 'Backspace') {
    s.inputBuffer = s.inputBuffer.slice(0, -1)
    if (s.inputBuffer.length === 0) s.activeEnemyId = null
    return s
  }

  if (key.length !== 1 || !/[a-zA-Z0-9]/.test(key)) return s

  const newBuffer = s.inputBuffer + key.toLowerCase()

  const living = s.enemies.filter(e => !e.dead)

  // locked on active enemy
  if (s.activeEnemyId !== null) {
    const target = living.find(e => e.id === s.activeEnemyId)
    if (target) {
      const newTyped = target.typed + key.toLowerCase()
      if (matchesPrefix(target.target, newTyped)) {
        s.pendingEvents = ['keystroke']
        if (isComplete(target.target, newTyped)) {
          return killEnemy(s, target.id)
        }
        s.enemies = s.enemies.map(e => e.id === target.id ? { ...e, typed: newTyped } : e)
        s.inputBuffer = newBuffer
        return s
      } else {
        // mistake
        s.pendingEvents = ['error']
        s.combo = 0
        s.scoreSurgeStreak = 0
        s.critStreakCount = 0
        s.enemies = s.enemies.map(e => e.id === target.id ? { ...e, typed: '' } : e)
        s.inputBuffer = ''
        s.activeEnemyId = null
        return s
      }
    }
  }

  // acquire new target
  for (const e of living) {
    const testTyped = key.toLowerCase()
    if (matchesPrefix(e.target, testTyped)) {
      s.pendingEvents = ['keystroke']
      if (isComplete(e.target, testTyped)) {
        return killEnemy({ ...s, inputBuffer: '' }, e.id)
      }
      s.enemies = s.enemies.map(en => en.id === e.id ? { ...en, typed: testTyped } : en)
      s.inputBuffer = testTyped
      s.activeEnemyId = e.id
      return s
    }
  }

  // no match
  s.pendingEvents = ['error']
  s.combo = 0
  s.scoreSurgeStreak = 0
  s.critStreakCount = 0
  return s
}

function killEnemy(state: GameEngineState, enemyId: number): GameEngineState {
  let s = { ...state }
  const enemy = s.enemies.find(e => e.id === enemyId)
  if (!enemy) return s

  // crit check
  let isCrit = false
  if (s.critStreak > 0) {
    s.critStreakCount = (s.critStreakCount ?? 0) + 1
    if (s.critStreakCount >= s.critStreak) {
      isCrit = true
      s.critStreakCount = 0
    }
  }

  let newHp = enemy.hp - 1
  if (newHp > 0 && !isCrit) {
    s.enemies = s.enemies.map(e => e.id === enemyId ? { ...e, hp: newHp, typed: '' } : e)
    s.inputBuffer = ''
    const result = fireTurret(s.turret, enemy.x, enemy.y, s.combo)
    s.turret = result.turret
    s.projectiles = [...s.projectiles, result.projectile]
    s.pendingEvents = [...s.pendingEvents, 'keystroke']
    return s
  }

  // kill confirmed
  s.enemies = s.enemies.map(e => e.id === enemyId ? { ...e, dead: true } : e)
  s.particles = [...s.particles, ...createExplosion(enemy.x, enemy.y, enemy.glowColor, isCrit ? 24 : 14)]

  // sound & shake for boss kill
  const killSound: SoundEvent = enemy.type === 'boss' ? 'kill_boss' : 'kill'
  s.pendingEvents = [...s.pendingEvents, killSound]
  if (enemy.type === 'boss') s.pendingShake = Math.max(s.pendingShake, 8)

  // chain explosion
  if (s.chainExplosion) {
    s.enemies = s.enemies.map(e => {
      if (e.dead || e.id === enemyId) return e
      const dist = Math.hypot(e.x - enemy.x, e.y - enemy.y)
      if (dist <= 50) {
        const newHp = e.hp - 1
        if (newHp <= 0) {
          s.particles = [...s.particles, ...createExplosion(e.x, e.y, e.glowColor, 8)]
          return { ...e, dead: true }
        }
        return { ...e, hp: newHp }
      }
      return e
    })
  }

  // word_freeze: 30% chance to freeze nearby enemies
  if (s.upgrades.includes('word_freeze')) {
    if (Math.random() < 0.3) {
      s.enemies = s.enemies.map(e => {
        if (e.dead || e.id === enemyId) return e
        const dist = Math.hypot(e.x - enemy.x, e.y - enemy.y)
        if (dist <= 100) return { ...e, frozen: true, frozenTimer: 1.5 }
        return e
      })
      s.pendingEvents = [...s.pendingEvents, 'freeze']
    }
  }

  // scoring: combo milestone sounds
  const prevCombo = s.combo
  s.combo = prevCombo + 1
  s.maxCombo = Math.max(s.maxCombo, s.combo)

  if (s.combo === 5) s.pendingEvents = [...s.pendingEvents, 'combo5']
  else if (s.combo === 10) s.pendingEvents = [...s.pendingEvents, 'combo10']
  else if (s.combo === 20) s.pendingEvents = [...s.pendingEvents, 'combo20']

  // score: improved combo multiplier
  const pointsPerType: Record<string, number> = { infantry: 10, speeder: 15, tank: 25, elite: 40, boss: 100 }
  const basePoints = pointsPerType[enemy.type] ?? 10
  const comboMult = s.combo >= 20 ? 3 : s.combo >= 10 ? 2 : s.combo >= 5 ? 1.5 : 1

  // score_surge: track and apply
  let surgeMult = 1
  if (s.upgrades.includes('score_surge')) {
    s.scoreSurgeStreak = (s.scoreSurgeStreak ?? 0) + 1
    if (s.scoreSurgeKills > 0) {
      surgeMult = 3
      s.scoreSurgeKills -= 1
    } else if (s.scoreSurgeStreak >= 8) {
      s.scoreSurgeKills = 5
      s.scoreSurgeStreak = 0
      surgeMult = 3
      s.scoreSurgeKills -= 1
    }
  }

  s.score += Math.floor(basePoints * comboMult * surgeMult * (isCrit ? 3 : 1))

  const result = fireTurret(s.turret, enemy.x, enemy.y, s.combo)
  s.turret = result.turret
  s.projectiles = [...s.projectiles, result.projectile]

  s.inputBuffer = ''
  s.activeEnemyId = null

  // bonus score if wave cleared early
  const stillLiving = s.enemies.filter(e => !e.dead)
  if (stillLiving.length === 0 && s.spawnQueue.length === 0 && s.timer > 0) {
    s.score += Math.floor(s.timer) * 5
  }

  return s
}

export function handleUpgradeKey(state: GameEngineState, key: string): GameEngineState {
  if (state.gameState !== 'UPGRADE') return state

  if (key === 'a' || key === 'A') return applyUpgrade(state, 0)
  if (key === 'b' || key === 'B') return applyUpgrade(state, 1)
  if (key === 'c' || key === 'C') return applyUpgrade(state, 2)

  let newInput = state.upgradeInput
  if (key === 'Backspace') newInput = newInput.slice(0, -1)
  else if (key.length === 1) newInput = (newInput + key).toLowerCase()

  if (newInput === 'a') return applyUpgrade(state, 0)
  if (newInput === 'b') return applyUpgrade(state, 1)
  if (newInput === 'c') return applyUpgrade(state, 2)

  return { ...state, upgradeInput: newInput }
}

function applyUpgrade(state: GameEngineState, idx: number): GameEngineState {
  const option = state.upgradeOptions[idx]
  if (!option) return state

  const s = { ...state }
  option.apply(s)

  const newUpgrades = [...s.upgrades]
  if (!newUpgrades.includes(option.id)) newUpgrades.push(option.id)

  const nextLevel = s.level + 1
  const config = getLevelConfig(nextLevel)

  if (nextLevel > 10) {
    return { ...s, upgrades: newUpgrades, gameState: 'VICTORY', pendingEvents: ['victory'] }
  }

  resetWordSystem()
  autoTurretTimer = 10
  areaBombTimer = 0

  const schedule = buildSpawnSchedule(config, 1)
  const nextS: GameEngineState = {
    ...s,
    upgrades: newUpgrades,
    level: nextLevel,
    wave: 1,
    totalWaves: config.waves,
    timer: config.duration + s.timeBonusSeconds,
    enemies: [],
    projectiles: [],
    particles: [],
    spawnQueue: schedule,
    nextSpawnTime: 0,
    inputBuffer: '',
    activeEnemyId: null,
    turret: createTurret(),
    upgradeInput: '',
    upgradeOptions: [],
    gameState: 'PLAYING',
    waveEnemyTotal: schedule.length,
    pendingEvents: EMPTY_EVENTS,
    pendingShake: 0,
  }
  return nextS
}
