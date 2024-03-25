import { SpecialLectureApplicationResult } from './special-lectures.model'
import { SpecialLecturesRepository } from './special-lectures.repository'
import { Pool } from 'pg'
import { createConnection } from '../database'

export class SpecialLecturesRepositoryImpl
  implements SpecialLecturesRepository
{
  pool: Pool

  constructor() {
    this.pool = createConnection()
  }

  pushApplicantIntoLecture(userId: number): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async readResultOfApplicant(
    userId: number,
  ): Promise<SpecialLectureApplicationResult> {
    const result = await this.pool.query<SpecialLectureApplicationResult>(
      'SELECT userId, applied FROM specialLectures WHERE userId = $1',
      [userId],
    )

    if (result.rowCount === 0) {
      throw Error('Not Applied')
    }

    return result.rows[0]
  }

  count(): Promise<number> {
    throw new Error('Method not implemented.')
  }

  applicants(): Promise<number[]> {
    throw new Error('Method not implemented.')
  }

  withLock<T>(atom: (...args: unknown[]) => Promise<T>): Promise<T> {
    throw new Error('Method not implemented.')
  }
}
