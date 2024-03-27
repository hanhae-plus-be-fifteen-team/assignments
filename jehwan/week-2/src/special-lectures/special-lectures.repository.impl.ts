import { ISpecialLecturesRepository } from './special-lectures.repository.interface'
import { createDb } from '../database'
import pgPromise from 'pg-promise'
import { Mutex } from 'async-mutex'
import { SpecialLectureCountEntity } from './entities/special-lectures.entity'
import { ApplicationEntity } from './entities/application.entity'
import { Application } from './models/application.model'
import { SpecialLectureCount } from './models/special-lectures.model'

export class SpecialLecturesRepositoryImpl
  implements ISpecialLecturesRepository
{
  private readonly pg: pgPromise.IDatabase<unknown>
  private mutex: Mutex

  constructor() {
    this.pg = createDb()
    this.mutex = new Mutex()
  }

  /**
   *
   * @param lectureId lecture's id
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   */
  async pushApplicantIntoLecture(
    lectureId: number,
    userId: number,
    session?: pgPromise.ITask<unknown>,
  ): Promise<void> {
    const conn = session ?? this.pg

    await conn.none(
      'INSERT INTO special_lectures (lecture_id, user_id, applied) VALUES ($1, $2, $3)',
      [lectureId, userId, true],
    )
  }

  /**
   *
   * @param lectureId lecture's id
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   * @returns Business Domain Model (SpecialLectureApplicationResult)
   */
  async readResultOfApplicant(
    lectureId: number,
    userId: number,
    session?: pgPromise.ITask<unknown>,
  ): Promise<Application> {
    const conn = session ?? this.pg

    const result = await conn.oneOrNone<ApplicationEntity>(
      'SELECT user_id, applied, created_at FROM special_lectures WHERE lecture_id = $1 AND user_id = $2',
      [lectureId, userId],
    )

    return {
      lectureId,
      userId,
      applied: !!result,
      timestamp: result ? result.created_at : null,
    }
  }

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns count for the lecture
   */
  async count(
    lectureId: number,
    session?: pgPromise.ITask<unknown>,
  ): Promise<SpecialLectureCount> {
    const conn = session ?? this.pg

    const result = await conn.oneOrNone<SpecialLectureCountEntity>(
      'SELECT lecture_id, maximum, count FROM special_lecture_counts where lecture_id = $1',
      [lectureId],
    )

    return {
      lectureId,
      maximum: result?.maximum ?? 0,
      count: result?.count ?? 0,
    }
  }

  // @todo implement
  applicants(
    lectureId: number,
    session?: pgPromise.ITask<unknown>,
  ): Promise<Application[]> {
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
