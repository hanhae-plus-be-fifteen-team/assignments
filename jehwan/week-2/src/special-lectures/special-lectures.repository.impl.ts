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

  readResultOfApplicant(
    userId: number,
  ): Promise<SpecialLectureApplicationResult> {
    throw new Error('Method not implemented.')
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
