import { SpecialLectureApplicationResult } from './special-lectures.model'
import { SpecialLecturesRepository } from './special-lectures.repository'
import { Pool, PoolClient } from 'pg'
import { createPool } from '../database'

export class SpecialLecturesRepositoryImpl
  implements SpecialLecturesRepository
{
  private readonly pool: Pool
  private client: PoolClient | null = null

  constructor() {
    this.pool = createPool()
  }

  async pushApplicantIntoLecture(userId: number): Promise<void> {
    await this.client.query<unknown>(
      'INSERT INTO special_lectures (user_id, applied) VALUES ($1, $2)',
      [userId, true],
    )
  }

  async readResultOfApplicant(
    userId: number,
  ): Promise<SpecialLectureApplicationResult> {
    const result = await this.client.query<{
      user_id: number
      applied: boolean
    }>('SELECT user_id, applied FROM special_lectures WHERE user_id = $1', [
      userId,
    ])

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
    const result = await this.client.query<{ count: number }>(
      'SELECT count(*) as count FROM special_lectures',
    )

    return result.rows[0].count
  }

  applicants(): Promise<number[]> {
    throw new Error('Method not implemented.')
  }

  async withLock<T>(atom: () => Promise<T>): Promise<T> {
    this.client = await this.pool.connect()
    try {
      await this.client.query('BEGIN')
      await this.client.query('LOCK TABLE special_lectures IN EXCLUSIVE MODE')
      const result = await atom()
      await this.client.query('COMMIT')
      return result
    } catch (error) {
      await this.client.query('ROLLBACK')
      throw error
    } finally {
      if (this.client) {
        this.client.release()
      }
      this.client = null
    }
  }

  async close() {
    await this.pool.end()
  }
}
