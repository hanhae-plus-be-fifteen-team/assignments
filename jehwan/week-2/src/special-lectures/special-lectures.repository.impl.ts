import { SpecialLectureApplicationResult } from './special-lectures.model'
import { SpecialLecturesRepository } from './special-lectures.repository'
import { createDb } from '../database'
import pgPromise from 'pg-promise'

export class SpecialLecturesRepositoryImpl
  implements SpecialLecturesRepository
{
  private readonly pg: pgPromise.IDatabase<unknown>
  private promiseQueue: Promise<unknown>

  constructor() {
    this.pg = createDb()
    this.promiseQueue = Promise.resolve()
  }

  async pushApplicantIntoLecture(
    userId: number,
    session: pgPromise.ITask<unknown>,
  ): Promise<void> {
    await session.none(
      'INSERT INTO special_lectures (user_id, applied) VALUES ($1, $2)',
      [userId, true],
    )
  }

  async readResultOfApplicant(
    userId: number,
    session: pgPromise.ITask<unknown>,
  ): Promise<SpecialLectureApplicationResult> {
    const result = await session.oneOrNone<{
      user_id: number
      applied: boolean
    }>('SELECT user_id, applied FROM special_lectures WHERE user_id = $1', [
      userId,
    ])

    if (!result) {
      throw Error('Not Applied')
    }

    return {
      userId: result.user_id,
      applied: result.applied,
    }
  }

  async count(session: pgPromise.ITask<unknown>): Promise<number> {
    const result = await session.one<{ count: number }>(
      'SELECT count(*) as count FROM special_lectures',
    )

    return result.count
  }

  // @todo implement
  applicants(session: pgPromise.ITask<unknown>): Promise<number[]> {
    throw new Error('Method not implemented.')
  }

  /**
   * @todo Considering locks in a distributed cluster
   */
  async withLock<T>(
    atom: (session: pgPromise.ITask<unknown>) => Promise<T>,
  ): Promise<T> {
    const executeWithLock = () =>
      this.pg.tx<T>(async session => {
        await session.none(`LOCK TABLE special_lectures IN EXCLUSIVE MODE`)
        return await atom(session)
      })

    this.promiseQueue = this.promiseQueue.then(() => executeWithLock())

    return this.promiseQueue as Promise<T>
  }
}
