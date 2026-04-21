import type { Turret, Projectile } from './types'
import { CENTER_X, CENTER_Y, TURRET_BARREL_LENGTH, TURRET_BODY_RADIUS, COLORS } from './constants'

let nextId = 0

export function createTurret(): Turret {
  return {
    x: CENTER_X,
    y: CENTER_Y,
    angle: -Math.PI / 2,
    targetAngle: -Math.PI / 2,
    flashTimer: 0,
  }
}

export function updateTurret(turret: Turret, dt: number): Turret {
  // rotate toward target
  let diff = turret.targetAngle - turret.angle
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  const rotSpeed = 8
  const newAngle = turret.angle + Math.sign(diff) * Math.min(Math.abs(diff), rotSpeed * dt)
  return { ...turret, angle: newAngle, flashTimer: Math.max(0, turret.flashTimer - dt) }
}

export function aimTurret(turret: Turret, tx: number, ty: number): Turret {
  const angle = Math.atan2(ty - turret.y, tx - turret.x)
  return { ...turret, targetAngle: angle }
}

export function fireTurret(turret: Turret, tx: number, ty: number, combo: number): { turret: Turret; projectile: Projectile } {
  const color = combo >= 50 ? COLORS.projectile.crit
    : combo >= 20 ? COLORS.projectile.high
    : combo >= 10 ? COLORS.projectile.mid
    : COLORS.projectile.normal

  const bx = turret.x + Math.cos(turret.angle) * TURRET_BARREL_LENGTH
  const by = turret.y + Math.sin(turret.angle) * TURRET_BARREL_LENGTH

  return {
    turret: { ...turret, flashTimer: 0.12 },
    projectile: {
      id: nextId++,
      x: bx,
      y: by,
      targetX: tx,
      targetY: ty,
      speed: 5,
      color,
      done: false,
      progress: 0,
    },
  }
}

export function updateProjectiles(projectiles: Projectile[], dt: number): Projectile[] {
  return projectiles
    .map(p => {
      const newProgress = p.progress + dt * 3.5
      return { ...p, progress: newProgress, done: newProgress >= 1 }
    })
    .filter(p => !p.done || p.progress < 1.2)
}

export function drawTurret(ctx: CanvasRenderingContext2D, turret: Turret) {
  const { x, y, angle, flashTimer } = turret

  ctx.save()
  ctx.translate(x, y)

  // base platform
  ctx.shadowBlur = 15
  ctx.shadowColor = COLORS.center
  ctx.strokeStyle = COLORS.center
  ctx.lineWidth = 2
  ctx.fillStyle = '#0f2040'
  ctx.beginPath()
  ctx.arc(0, 0, TURRET_BODY_RADIUS + 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // body rings
  ctx.strokeStyle = '#1e3a5f'
  ctx.lineWidth = 1
  for (let r = 6; r <= TURRET_BODY_RADIUS; r += 6) {
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // barrel
  ctx.rotate(angle)
  ctx.shadowBlur = flashTimer > 0 ? 30 : 10
  ctx.shadowColor = flashTimer > 0 ? '#ffffff' : COLORS.turretBarrel
  ctx.strokeStyle = flashTimer > 0 ? '#ffffff' : COLORS.turretBarrel
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(TURRET_BARREL_LENGTH, 0)
  ctx.stroke()

  // barrel tip accent
  ctx.fillStyle = flashTimer > 0 ? '#ffffff' : COLORS.turretBarrel
  ctx.beginPath()
  ctx.arc(TURRET_BARREL_LENGTH, 0, 3, 0, Math.PI * 2)
  ctx.fill()

  // muzzle flash
  if (flashTimer > 0) {
    const alpha = flashTimer / 0.12
    ctx.globalAlpha = alpha
    ctx.fillStyle = '#ffffff'
    ctx.shadowBlur = 20
    ctx.shadowColor = '#ffffff'
    ctx.beginPath()
    ctx.arc(TURRET_BARREL_LENGTH + 4, 0, 6 * alpha, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

export function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]) {
  for (const p of projectiles) {
    const t = Math.min(p.progress, 1)
    const cx = p.x + (p.targetX - p.x) * t
    const cy = p.y + (p.targetY - p.y) * t

    ctx.save()
    ctx.shadowBlur = 12
    ctx.shadowColor = p.color
    ctx.fillStyle = p.color
    ctx.globalAlpha = 1 - Math.max(0, t - 0.85) * 6.7
    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fill()

    // trail
    ctx.globalAlpha = 0.3
    ctx.beginPath()
    const trailT = Math.max(0, t - 0.12)
    ctx.moveTo(p.x + (p.targetX - p.x) * trailT, p.y + (p.targetY - p.y) * trailT)
    ctx.lineTo(cx, cy)
    ctx.strokeStyle = p.color
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.restore()
  }
}
