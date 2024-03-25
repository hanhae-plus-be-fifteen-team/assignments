import { SpecialLectureApplicationResult } from './special-lectures.model'
import { SpecialLecturesRepository } from './special-lectures.repository'
import { Pool } from 'pg'
import { createConnection } from '../database'

export class SpecialLecturesRepositoryImpl
  implements SpecialLecturesRepository
{
  private readonly pool: Pool

  constructor() {
    this.pool = createConnection()
  }

  async pushApplicantIntoLecture(userId: number): Promise<void> {
    await this.pool.query<unknown>(
      'INSERT INTO special_lectures (user_id, applied) VALUES ($1, $2)',
      [userId, true],
    )
  }

  async readResultOfApplicant(
    userId: number,
  ): Promise<SpecialLectureApplicationResult> {
    const result = await this.pool.query<{ user_id: number; applied: boolean }>(
      'SELECT user_id, applied FROM special_lectures WHERE user_id = $1',
      [userId],
    )

    if (result.rowCount === 0) {
      throw Error('Not Applied')
    }

    const raw = result.rows[0]

    return {
      userId: raw.user_id,
      applied: raw.applied,
    }
  }

  async count(): Promise<number> {
    const result = await this.pool.query<{ count: number }>(
      'SELECT count(*) as count FROM special_lectures',
    )

    return result.rows[0].count
  }

  applicants(): Promise<number[]> {
    throw new Error('Method not implemented.')
  }

  async withLock<T>(atom: () => Promise<T>): Promise<T> {
    await this.pool.query('BEGIN')
    await this.pool.query('LOCK TABLE special_lectures IN EXCLUSIVE MODE')
    try {
      const result = await atom()
      await this.pool.query('COMMIT')
      return result
    } catch (error) {
      await this.pool.query('ROLLBACK')
      throw error
    }
  }

  async close() {
    await this.pool.end()
  }
}
