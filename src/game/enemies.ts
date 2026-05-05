import type { Enemy, EnemyType, Language } from './types'
import { CENTER_X, CENTER_Y, CANVAS_WIDTH, CANVAS_HEIGHT, ENEMY_BASE_SPEED, ENEMY_SIZES, COLORS } from './constants'
import { pickWord } from './wordSystem'

let nextId = 0

function spawnPosition(): { x: number; y: number } {
  const side = Math.floor(Math.random() * 4)
  const margin = 30
  switch (side) {
    case 0: return { x: Math.random() * CANVAS_WIDTH, y: -margin }
    case 1: return { x: CANVAS_WIDTH + margin, y: Math.random() * CANVAS_HEIGHT }
    case 2: return { x: Math.random() * CANVAS_WIDTH, y: CANVAS_HEIGHT + margin }
    default: return { x: -margin, y: Math.random() * CANVAS_HEIGHT }
  }
}

const HP_MAP: Record<EnemyType, number> = {
  infantry: 1,
  tank: 3,
  speeder: 1,
  elite: 2,
  boss: 5,
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

// Speeder: 2-point zigzag path
function zigzagWaypoints(sx: number, sy: number): { x: number; y: number }[] {
  const dx = CENTER_X - sx, dy = CENTER_Y - sy
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist, ny = dy / dist
  const px = -ny, py = nx
  const amp = 100 + Math.random() * 60
  const sign = Math.random() < 0.5 ? 1 : -1
  const margin = 60
  return [
    {
      x: clamp(sx + nx * dist * 0.35 + px * amp * sign, margin, CANVAS_WIDTH - margin),
      y: clamp(sy + ny * dist * 0.35 + py * amp * sign, margin, CANVAS_HEIGHT - margin),
    },
    {
      x: clamp(sx + nx * dist * 0.65 - px * amp * sign, margin, CANVAS_WIDTH - margin),
      y: clamp(sy + ny * dist * 0.65 - py * amp * sign, margin, CANVAS_HEIGHT - margin),
    },
  ]
}

// Elite: 3-point arc path (curved approach from the side)
function arcWaypoints(sx: number, sy: number): { x: number; y: number }[] {
  const dx = CENTER_X - sx, dy = CENTER_Y - sy
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = dx / dist, ny = dy / dist
  const px = -ny, py = nx
  const amp = 80
  const sign = Math.random() < 0.5 ? 1 : -1
  const margin = 70
  return [
    {
      x: clamp(sx + nx * dist * 0.3 + px * amp * sign, margin, CANVAS_WIDTH - margin),
      y: clamp(sy + ny * dist * 0.3 + py * amp * sign, margin, CANVAS_HEIGHT - margin),
    },
    {
      x: clamp(sx + nx * dist * 0.6 + px * amp * 0.5 * sign, margin, CANVAS_WIDTH - margin),
      y: clamp(sy + ny * dist * 0.6 + py * amp * 0.5 * sign, margin, CANVAS_HEIGHT - margin),
    },
    {
      x: clamp(sx + nx * dist * 0.82, margin, CANVAS_WIDTH - margin),
      y: clamp(sy + ny * dist * 0.82, margin, CANVAS_HEIGHT - margin),
    },
  ]
}

// Boss: wide spiral approach
function spiralWaypoints(sx: number, sy: number): { x: number; y: number }[] {
  const dx = CENTER_X - sx, dy = CENTER_Y - sy
  const dist = Math.sqrt(dx * dx + dy * dy)
  const baseAngle = Math.atan2(dy, dx)
  const margin = 80
  const rotDir = Math.random() < 0.5 ? 1 : -1
  return [0.25, 0.5, 0.72].map((t, i) => {
    const angle = baseAngle + rotDir * (0.5 - i * 0.15)
    const r = dist * (1 - t) * 0.7 + 80
    return {
      x: clamp(CENTER_X - Math.cos(angle) * r, margin, CANVAS_WIDTH - margin),
      y: clamp(CENTER_Y - Math.sin(angle) * r, margin, CANVAS_HEIGHT - margin),
    }
  })
}

function generateWaypoints(type: EnemyType, sx: number, sy: number): { x: number; y: number }[] | undefined {
  if (type === 'speeder') return zigzagWaypoints(sx, sy)
  if (type === 'elite') return arcWaypoints(sx, sy)
  if (type === 'boss') return spiralWaypoints(sx, sy)
  return undefined
}

export function createEnemy(type: EnemyType, lang: Language, speedMult: number): Enemy {
  const { x, y } = spawnPosition()
  const dx = CENTER_X - x
  const dy = CENTER_Y - y
  const angle = Math.atan2(dy, dx)
  const w = pickWord(type, lang)
  const col = COLORS.enemies[type]
  const hp = HP_MAP[type]
  const waypoints = generateWaypoints(type, x, y)

  return {
    id: nextId++,
    x, y, type,
    word: w.display,
    target: w.target,
    typed: '',
    hp, maxHp: hp,
    speed: ENEMY_BASE_SPEED * speedMult * (type === 'speeder' ? 1.8 : type === 'tank' ? 0.6 : type === 'boss' ? 0.4 : 1),
    angle,
    size: ENEMY_SIZES[type] ?? 14,
    color: col.body,
    glowColor: col.glow,
    dead: false,
    exploding: false,
    explosionTimer: 0,
    waypoints,
    waypointIndex: waypoints ? 0 : undefined,
    frozen: false,
    frozenTimer: 0,
  }
}

export function updateEnemies(enemies: Enemy[], dt: number): Enemy[] {
  return enemies.map(e => {
    if (e.dead) return e

    // frozen: countdown and skip movement
    if (e.frozen) {
      const ft = (e.frozenTimer ?? 0) - dt
      if (ft <= 0) return { ...e, frozen: false, frozenTimer: 0 }
      return { ...e, frozenTimer: ft }
    }

    // determine current target position
    let tx: number, ty: number
    const wpIdx = e.waypointIndex ?? 0
    const wps = e.waypoints

    if (wps && wpIdx < wps.length) {
      const wp = wps[wpIdx]
      tx = wp.x
      ty = wp.y
      const distToWp = Math.sqrt((tx - e.x) ** 2 + (ty - e.y) ** 2)
      if (distToWp < e.speed * dt + 8) {
        // reached this waypoint, advance
        const nextIdx = wpIdx + 1
        if (nextIdx < wps.length) {
          return { ...e, waypointIndex: nextIdx }
        }
        // no more waypoints — fall through to center targeting
        return { ...e, waypointIndex: wps.length }
      }
    } else {
      tx = CENTER_X
      ty = CENTER_Y
    }

    const dx = tx - e.x
    const dy = ty - e.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 4) return { ...e, dead: true }
    const nx = dx / dist
    const ny = dy / dist
    return { ...e, x: e.x + nx * e.speed * dt, y: e.y + ny * e.speed * dt }
  })
}

export function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, isTarget: boolean) {
  if (e.dead) return

  ctx.save()
  ctx.translate(e.x, e.y)

  // frozen tint override
  const frozen = e.frozen
  const glowCol = frozen ? '#7dd3fc88' : e.glowColor
  const bodyCol = frozen ? '#7dd3fc' : e.color

  // glow
  ctx.shadowBlur = isTarget ? 20 : 10
  ctx.shadowColor = glowCol

  // body shape per type
  ctx.strokeStyle = bodyCol
  ctx.lineWidth = isTarget ? 2.5 : 1.5
  ctx.fillStyle = bodyCol + '22'

  if (e.type === 'boss') {
    drawHexagon(ctx, e.size)
    drawHexagon(ctx, e.size * 0.6)
  } else if (e.type === 'tank') {
    ctx.beginPath()
    ctx.rect(-e.size, -e.size * 0.7, e.size * 2, e.size * 1.4)
    ctx.fill(); ctx.stroke()
  } else if (e.type === 'speeder') {
    ctx.beginPath()
    ctx.moveTo(0, -e.size * 1.4)
    ctx.lineTo(e.size * 0.7, e.size)
    ctx.lineTo(-e.size * 0.7, e.size)
    ctx.closePath()
    ctx.fill(); ctx.stroke()
  } else if (e.type === 'elite') {
    drawHexagon(ctx, e.size)
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.arc(0, 0, e.size + 6, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  } else {
    // infantry: diamond
    ctx.beginPath()
    ctx.moveTo(0, -e.size)
    ctx.lineTo(e.size, 0)
    ctx.lineTo(0, e.size)
    ctx.lineTo(-e.size, 0)
    ctx.closePath()
    ctx.fill(); ctx.stroke()
  }

  // HP bar (only if multi-hp)
  if (e.maxHp > 1) {
    const bw = e.size * 2.4
    const bh = 4
    const by = e.size + 8
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(-bw / 2, by, bw, bh)
    ctx.fillStyle = bodyCol
    ctx.fillRect(-bw / 2, by, bw * (e.hp / e.maxHp), bh)
  }

  // frozen ice overlay
  if (frozen) {
    ctx.globalAlpha = 0.35
    ctx.fillStyle = '#bfdbfe'
    ctx.shadowBlur = 15
    ctx.shadowColor = '#7dd3fc'
    ctx.beginPath()
    ctx.arc(0, 0, e.size * 1.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.restore()

  // word label
  drawWordLabel(ctx, e, isTarget, frozen ?? false)
}

function drawHexagon(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
  }
  ctx.closePath()
  ctx.fill(); ctx.stroke()
}

function drawWordLabel(ctx: CanvasRenderingContext2D, e: Enemy, isTarget: boolean, frozen: boolean) {
  const labelY = e.y - e.size - 18
  const typed = e.typed
  const remaining = e.target.slice(typed.length)

  ctx.save()
  ctx.font = `bold ${isTarget ? 14 : 12}px 'Courier New', monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const fullText = e.target
  const metrics = ctx.measureText(fullText)
  const pw = metrics.width + 12
  const ph = 18
  ctx.fillStyle = frozen ? '#0a1a3acc' : '#0a0d1acc'
  ctx.beginPath()
  roundRect(ctx, e.x - pw / 2, labelY - ph / 2, pw, ph, 4)
  ctx.fill()

  if (typed.length > 0) {
    ctx.fillStyle = frozen ? '#93c5fd' : '#00e5ff'
    ctx.shadowBlur = 6
    ctx.shadowColor = frozen ? '#93c5fd' : '#00e5ff'
    const typedMetrics = ctx.measureText(typed)
    const remainMetrics = ctx.measureText(remaining)
    const totalWidth = typedMetrics.width + remainMetrics.width
    ctx.fillText(typed, e.x - totalWidth / 2 + typedMetrics.width / 2, labelY)
  }

  ctx.shadowBlur = 0
  ctx.fillStyle = isTarget ? '#e2e8f0' : '#94a3b8'
  if (typed.length > 0) {
    const typedMetrics = ctx.measureText(typed)
    const remainMetrics = ctx.measureText(remaining)
    const totalWidth = typedMetrics.width + remainMetrics.width
    ctx.fillText(remaining, e.x + totalWidth / 2 - remainMetrics.width / 2, labelY)
  } else {
    ctx.fillText(fullText, e.x, labelY)
  }

  if (e.word !== e.target) {
    ctx.font = `12px sans-serif`
    ctx.fillStyle = frozen ? '#7dd3fc' : '#64748b'
    ctx.fillText(e.word, e.x, labelY - 16)
  }

  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
}
