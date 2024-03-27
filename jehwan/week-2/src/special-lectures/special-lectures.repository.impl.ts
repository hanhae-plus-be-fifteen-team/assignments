import { SpecialLectureApplicationResult } from './special-lectures.model'
import { SpecialLecturesRepository } from './special-lectures.repository'
import { createDb } from '../database'
import pgPromise from 'pg-promise'
import { Mutex } from 'async-mutex'

/**
 * @description
 * Entity 를 DB Driver 에서 데이터를 다루는 형태라고 정의
 * 따라서, context 를 pg-promise 로 한정하여 RepositoryImpl 에 정의
 *
 * RepositoryImpl -> [ Repository Interface ] <- Service 구조에서
 * [ Repository Interface ] 에서 교환되는 데이터 형식은
 * 도메인 모델인 special-lectures.model.ts 에 정의된 `SpecialLectureApplicationResult`
 *
 * .readResultOfApplicant() 메서드에서 [Entity -> Domain] 으로 변환해서 반환
 */
interface SpecialLectureEntity {
  id: number
  user_id: number
  applied: boolean
  created_at: Date
}

export class SpecialLecturesRepositoryImpl
  implements SpecialLecturesRepository
{
  private readonly pg: pgPromise.IDatabase<unknown>
  private mutex: Mutex

  constructor() {
    this.pg = createDb()
    this.mutex = new Mutex()
  }

  /**
   *
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   */
  async pushApplicantIntoLecture(
    userId: number,
    session?: pgPromise.ITask<unknown>,
  ): Promise<void> {
    const conn = session ?? this.pg

    await conn.none(
      'INSERT INTO special_lectures (user_id, applied) VALUES ($1, $2)',
      [userId, true],
    )
  }

  /**
   *
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   * @returns Business Domain Model (SpecialLectureApplicationResult)
   */
  async readResultOfApplicant(
    userId: number,
    session?: pgPromise.ITask<unknown>,
  ): Promise<SpecialLectureApplicationResult> {
    const conn = session ?? this.pg

    const result = await conn.oneOrNone<SpecialLectureEntity>(
      'SELECT user_id, applied, created_at FROM special_lectures WHERE user_id = $1',
      [userId],
    )

    if (!result) {
      return {
        userId,
        applied: false,
      }
    }

    return {
      userId: result.user_id,
      applied: result.applied,
    }
  }

  /**
   *
   * @param session the session for Transaction
   * @returns count for the lecture
   */
  async count(session?: pgPromise.ITask<unknown>): Promise<number> {
    const conn = session ?? this.pg

    const result = await conn.one<{ count: number }>(
      'SELECT count(*) as count FROM special_lectures',
    )

    return result.count
  }

  // @todo implement
  applicants(session?: pgPromise.ITask<unknown>): Promise<number[]> {
    throw new Error('Method not implemented.')
  }

  /**
   *
   * @todo Considering locks in a distributed cluster
   * @param atom A function that guarantees atomicity
   * @returns Sequential execution is guaranteed using Node.js’ event loop.
   */
  async withLock<T>(
    atom: (session?: pgPromise.ITask<unknown>) => Promise<T>,
  ): Promise<T> {
    const release = await this.mutex.acquire()
    try {
      return await this.pg.tx<T>(async session => {
        await session.none(`LOCK TABLE special_lectures IN EXCLUSIVE MODE`)
        return await atom(session)
      })
    } finally {
      release()
    }
  }
}
