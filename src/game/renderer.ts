import { CANVAS_WIDTH, CANVAS_HEIGHT, CENTER_X, CENTER_Y, CENTER_RADIUS, COLORS } from './constants'
import type { GameEngineState } from './types'

export function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // grid lines
  ctx.strokeStyle = COLORS.gridLine
  ctx.lineWidth = 0.5
  ctx.globalAlpha = 0.4
  const spacing = 40
  for (let x = 0; x < CANVAS_WIDTH; x += spacing) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke()
  }
  for (let y = 0; y < CANVAS_HEIGHT; y += spacing) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke()
  }
  ctx.globalAlpha = 1

  // center glow rings
  const grad = ctx.createRadialGradient(CENTER_X, CENTER_Y, 0, CENTER_X, CENTER_Y, 200)
  grad.addColorStop(0, '#00e5ff0a')
  grad.addColorStop(1, '#00000000')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

export function drawCenter(ctx: CanvasRenderingContext2D, hp: number, maxHp: number) {
  ctx.save()
  ctx.translate(CENTER_X, CENTER_Y)

  // outer glow
  ctx.shadowBlur = 30
  ctx.shadowColor = COLORS.center
  ctx.strokeStyle = COLORS.center
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(0, 0, CENTER_RADIUS, 0, Math.PI * 2)
  ctx.stroke()

  // HP segments
  const segAngle = (Math.PI * 2) / maxHp
  for (let i = 0; i < maxHp; i++) {
    const startA = i * segAngle - Math.PI / 2
    const endA = startA + segAngle - 0.08
    ctx.shadowBlur = i < hp ? 20 : 0
    ctx.strokeStyle = i < hp ? COLORS.center : '#1e293b'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(0, 0, CENTER_RADIUS + 10, startA, endA)
    ctx.stroke()
  }

  ctx.restore()
}

export function drawHUD(ctx: CanvasRenderingContext2D, state: GameEngineState) {
  const { score, combo, level, wave, totalWaves, timer } = state

  ctx.save()
  ctx.font = 'bold 13px "Courier New", monospace'
  ctx.fillStyle = COLORS.hud

  // top-left: level / wave
  ctx.textAlign = 'left'
  ctx.fillText(`LEVEL ${level}`, 16, 30)
  ctx.fillText(`WAVE ${wave} / ${totalWaves}`, 16, 48)

  // top-center: timer
  const mins = Math.floor(timer / 60)
  const secs = Math.floor(timer % 60)
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`
  ctx.textAlign = 'center'
  ctx.font = `bold ${timer <= 10 ? 22 : 18}px "Courier New", monospace`
  ctx.fillStyle = timer <= 10 ? '#ef4444' : COLORS.hudBright
  if (timer <= 10) { ctx.shadowBlur = 12; ctx.shadowColor = '#ef4444' }
  ctx.fillText(timeStr, CANVAS_WIDTH / 2, 30)
  ctx.shadowBlur = 0

  // top-right: score
  ctx.textAlign = 'right'
  ctx.font = 'bold 13px "Courier New", monospace'
  ctx.fillStyle = COLORS.hud
  ctx.fillText('SCORE', CANVAS_WIDTH - 16, 20)
  ctx.font = 'bold 20px "Courier New", monospace'
  ctx.fillStyle = COLORS.hudBright
  ctx.fillText(score.toString().padStart(6, '0'), CANVAS_WIDTH - 16, 40)

  // combo counter (bottom-center)
  if (combo > 0) {
    const comboColor = combo >= 50 ? COLORS.comboCrit : combo >= 20 ? COLORS.comboHigh : combo >= 10 ? COLORS.comboMid : COLORS.comboLow
    ctx.textAlign = 'center'
    ctx.font = `bold ${Math.min(16 + combo * 0.1, 24)}px "Courier New", monospace`
    ctx.fillStyle = comboColor
    ctx.shadowBlur = 10
    ctx.shadowColor = comboColor
    ctx.fillText(`× ${combo} COMBO`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20)
    ctx.shadowBlur = 0
  }

  // input buffer
  if (state.inputBuffer.length > 0) {
    ctx.textAlign = 'center'
    ctx.font = 'bold 14px "Courier New", monospace'
    ctx.fillStyle = '#00e5ff'
    ctx.shadowBlur = 8
    ctx.shadowColor = '#00e5ff'
    ctx.fillText(`> ${state.inputBuffer}_`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 42)
    ctx.shadowBlur = 0
  }

  ctx.restore()
}
