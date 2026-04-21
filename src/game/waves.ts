import type { LevelConfig, EnemyType } from './types'
import { LEVELS } from './constants'

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS[Math.min(level - 1, LEVELS.length - 1)]
}

export function buildSpawnSchedule(config: LevelConfig, wave: number): Array<{ time: number; type: EnemyType }> {
  const schedule: Array<{ time: number; type: EnemyType }> = []
  const isLastWave = wave === config.waves
  const count = isLastWave && config.hasBoss ? config.maxEnemies + 1 : config.maxEnemies

  for (let i = 0; i < count; i++) {
    const time = i * config.spawnInterval
    let type: EnemyType

    if (isLastWave && config.hasBoss && i === Math.floor(count / 2)) {
      type = 'boss'
    } else {
      const pool = config.enemyTypes
      type = pool[Math.floor(Math.random() * pool.length)]
    }
    schedule.push({ time, type })
  }

  return schedule
}
