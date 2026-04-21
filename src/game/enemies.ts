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

export function createEnemy(type: EnemyType, lang: Language, speedMult: number): Enemy {
  const { x, y } = spawnPosition()
  const dx = CENTER_X - x
  const dy = CENTER_Y - y
  const angle = Math.atan2(dy, dx)
  const w = pickWord(type, lang)
  const col = COLORS.enemies[type]
  const hp = HP_MAP[type]

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
  }
}

export function updateEnemies(enemies: Enemy[], dt: number): Enemy[] {
  return enemies.map(e => {
    if (e.dead) return e
    const dx = CENTER_X - e.x
    const dy = CENTER_Y - e.y
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

  // glow
  ctx.shadowBlur = isTarget ? 20 : 10
  ctx.shadowColor = e.glowColor

  // body shape per type
  ctx.strokeStyle = e.color
  ctx.lineWidth = isTarget ? 2.5 : 1.5
  ctx.fillStyle = e.color + '22'

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
    // shield ring
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
    ctx.fillStyle = e.color
    ctx.fillRect(-bw / 2, by, bw * (e.hp / e.maxHp), bh)
  }

  ctx.restore()

  // word label
  drawWordLabel(ctx, e, isTarget)
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

function drawWordLabel(ctx: CanvasRenderingContext2D, e: Enemy, isTarget: boolean) {
  const labelY = e.y - e.size - 18
  const typed = e.typed
  const remaining = e.target.slice(typed.length)

  ctx.save()
  ctx.font = `bold ${isTarget ? 14 : 12}px 'Courier New', monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // background pill
  const fullText = e.target
  const metrics = ctx.measureText(fullText)
  const pw = metrics.width + 12
  const ph = 18
  ctx.fillStyle = '#0a0d1acc'
  ctx.beginPath()
  roundRect(ctx, e.x - pw / 2, labelY - ph / 2, pw, ph, 4)
  ctx.fill()

  // typed part (cyan)
  if (typed.length > 0) {
    ctx.fillStyle = '#00e5ff'
    ctx.shadowBlur = 6
    ctx.shadowColor = '#00e5ff'
    const typedMetrics = ctx.measureText(typed)
    const remainMetrics = ctx.measureText(remaining)
    const totalWidth = typedMetrics.width + remainMetrics.width
    ctx.fillText(typed, e.x - totalWidth / 2 + typedMetrics.width / 2, labelY)
  }

  // remaining part
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

  // display word (chinese/etc) above target
  if (e.word !== e.target) {
    ctx.font = `12px sans-serif`
    ctx.fillStyle = '#64748b'
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
