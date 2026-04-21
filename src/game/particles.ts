import type { Particle } from './types'

let nextId = 0

export function createExplosion(x: number, y: number, color: string, count = 12): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const speed = 60 + Math.random() * 80
    particles.push({
      id: nextId++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color,
      size: 2 + Math.random() * 3,
    })
  }
  return particles
}

export function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vx: p.vx * 0.92,
      vy: p.vy * 0.92,
      life: p.life - dt * 1.8,
    }))
    .filter(p => p.life > 0)
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    ctx.save()
    ctx.globalAlpha = p.life
    ctx.fillStyle = p.color
    ctx.shadowBlur = 6
    ctx.shadowColor = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}
