import type { GameEngineState, Language } from './types'
import { CENTER_X, CENTER_Y, CENTER_RADIUS, CANVAS_WIDTH, CANVAS_HEIGHT } from './constants'
import { createTurret, updateTurret, aimTurret, fireTurret, updateProjectiles, drawTurret, drawProjectiles } from './turret'
import { createEnemy, updateEnemies, drawEnemy } from './enemies'
import { createExplosion, updateParticles, drawParticles } from './particles'
import { drawBackground, drawCenter, drawHUD } from './renderer'
import { matchesPrefix, isComplete, resetWordSystem } from './wordSystem'
import { getLevelConfig, buildSpawnSchedule } from './waves'
import { pickUpgradeOptions } from './upgrades'

type StateChangeCallback = (state: GameEngineState) => void

export function createInitialState(canvas: HTMLCanvasElement, lang: Language): GameEngineState {
  const ctx = canvas.getContext('2d')!
  return {
    canvas, ctx,
    gameState: 'MENU',
    language: lang,
    level: 1,
    wave: 1,
    totalWaves: 2,
    timer: 60,
    score: 0,
    combo: 0,
    maxCombo: 0,
    centerHp: 3,
    maxCenterHp: 3,
    enemies: [],
    projectiles: [],
    particles: [],
    turret: createTurret(),
    inputBuffer: '',
    activeEnemyId: null,
    lastTime: 0,
    rafId: null,
    spawnQueue: [],
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
  }
}

export function startGame(state: GameEngineState): GameEngineState {
  resetWordSystem()
  const config = getLevelConfig(1)
  return {
    ...state,
    level: 1,
    wave: 1,
    score: 0,
    combo: 0,
    maxCombo: 0,
    centerHp: 3,
    maxCenterHp: 3,
    upgrades: [],
    upgradeInput: '',
    speedMultiplier: 1,
    autoTurretCooldown: 0,
    chainExplosion: false,
    piercing: false,
    wordReveal: false,
    critStreak: 0,
    critStreakCount: 0,
    timeBonusSeconds: 0,
    totalWaves: config.waves,
    timer: config.duration,
    gameState: 'PLAYING',
    enemies: [],
    projectiles: [],
    particles: [],
    spawnQueue: buildSpawnSchedule(config, 1),
    nextSpawnTime: 0,
    inputBuffer: '',
    activeEnemyId: null,
    turret: createTurret(),
  }
}

function autoTurretTick(state: GameEngineState, dt: number): GameEngineState {
  if (state.autoTurretCooldown <= 0) return state
  // not purchased yet (initial value 0 means inactive, positive means purchased and counting)
  if (!state.upgrades.includes('auto_turret')) return state

  let nextState = { ...state }

  // Use a separate timer tracked in upgrades store — here we approximate by subtracting dt each frame
  // We store the remaining cooldown as a negative number hack: autoTurretCooldown starts at 10 when purchased
  // We need a separate field — but to avoid changing types mid-flight, use nextSpawnTime as proxy...
  // Actually, let's just handle it simply: track last auto time in a closure via module-level variable
  return nextState
}

let autoTurretTimer = 10

export function gameLoop(
  state: GameEngineState,
  timestamp: number,
  onStateChange: StateChangeCallback,
): GameEngineState {
  if (state.gameState !== 'PLAYING') return state

  const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05)
  let s = { ...state, lastTime: timestamp }

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
        s.particles = [...s.particles, ...createExplosion(CENTER_X, CENTER_Y, '#ef444488', 8)]
        if (s.centerHp <= 0) {
          onStateChange({ ...s, gameState: 'GAME_OVER' })
          return { ...s, gameState: 'GAME_OVER' }
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
    // wave complete
    const config = getLevelConfig(s.level)
    if (s.wave >= config.waves) {
      // level complete
      const options = pickUpgradeOptions(s.upgrades)
      onStateChange({ ...s, gameState: 'UPGRADE', upgradeOptions: options, upgradeInput: '' })
      return { ...s, gameState: 'UPGRADE', upgradeOptions: options, upgradeInput: '' }
    } else {
      const nextWave = s.wave + 1
      const nextSchedule = buildSpawnSchedule(config, nextWave)
      s = { ...s, wave: nextWave, timer: config.duration + s.timeBonusSeconds, enemies: [], spawnQueue: nextSchedule, nextSpawnTime: 0, inputBuffer: '', activeEnemyId: null }
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

  let s = { ...state }

  if (key === 'Backspace') {
    s.inputBuffer = s.inputBuffer.slice(0, -1)
    if (s.inputBuffer.length === 0) s.activeEnemyId = null
    return s
  }

  if (key.length !== 1 || !/[a-zA-Z0-9]/.test(key)) return s

  const newBuffer = s.inputBuffer + key.toLowerCase()

  // find matching enemy
  const living = s.enemies.filter(e => !e.dead)

  // if locked on active, check it first
  if (s.activeEnemyId !== null) {
    const target = living.find(e => e.id === s.activeEnemyId)
    if (target) {
      const newTyped = target.typed + key.toLowerCase()
      if (matchesPrefix(target.target, newTyped)) {
        if (isComplete(target.target, newTyped)) {
          return killEnemy(s, target.id)
        }
        s.enemies = s.enemies.map(e => e.id === target.id ? { ...e, typed: newTyped } : e)
        s.inputBuffer = newBuffer
        return s
      } else {
        // mistake — reset typed but keep lock
        s.combo = 0
        s.critStreakCount = 0
        s.enemies = s.enemies.map(e => e.id === target.id ? { ...e, typed: '' } : e)
        s.inputBuffer = ''
        s.activeEnemyId = null
        return s
      }
    }
  }

  // try to acquire new target
  for (const e of living) {
    const testTyped = key.toLowerCase()
    if (matchesPrefix(e.target, testTyped)) {
      if (isComplete(e.target, testTyped)) {
        return killEnemy({ ...s, inputBuffer: '' }, e.id)
      }
      s.enemies = s.enemies.map(en => en.id === e.id ? { ...en, typed: testTyped } : en)
      s.inputBuffer = testTyped
      s.activeEnemyId = e.id
      return s
    }
  }

  // no match — wrong key, reset combo
  s.combo = 0
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
    return s
  }

  // kill
  s.enemies = s.enemies.map(e => e.id === enemyId ? { ...e, dead: true } : e)
  s.particles = [...s.particles, ...createExplosion(enemy.x, enemy.y, enemy.glowColor, isCrit ? 24 : 14)]

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

  const pointsPerType: Record<string, number> = { infantry: 10, speeder: 15, tank: 25, elite: 40, boss: 100 }
  const basePoints = pointsPerType[enemy.type] ?? 10
  const comboMult = 1 + Math.floor(s.combo / 10) * 0.2
  s.score += Math.floor(basePoints * comboMult * (isCrit ? 3 : 1))
  s.combo = s.combo + 1
  s.maxCombo = Math.max(s.maxCombo, s.combo)

  const result = fireTurret(s.turret, enemy.x, enemy.y, s.combo)
  s.turret = result.turret
  s.projectiles = [...s.projectiles, result.projectile]

  s.inputBuffer = ''
  s.activeEnemyId = null

  // check if all enemies cleared and spawn queue empty
  const stillLiving = s.enemies.filter(e => !e.dead)
  if (stillLiving.length === 0 && s.spawnQueue.length === 0 && s.timer > 0) {
    // bonus time remaining as score
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
    return { ...s, upgrades: newUpgrades, gameState: 'VICTORY' }
  }

  resetWordSystem()
  autoTurretTimer = 10

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
    spawnQueue: buildSpawnSchedule(config, 1),
    nextSpawnTime: 0,
    inputBuffer: '',
    activeEnemyId: null,
    turret: createTurret(),
    upgradeInput: '',
    upgradeOptions: [],
    gameState: 'PLAYING',
  }
  return nextS
}
