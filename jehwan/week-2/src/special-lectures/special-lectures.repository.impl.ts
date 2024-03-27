import { ISpecialLecturesRepository } from './special-lectures.repository.interface'
import { createDb } from '../database'
import pgPromise from 'pg-promise'
import { Mutex } from 'async-mutex'
import {
  SpecialLectureCountEntity,
  SpecialLectureEntity,
} from './entities/special-lectures.entity'
import { ApplicationEntity } from './entities/application.entity'
import { Application } from './models/application.model'
import {
  SpecialLecture,
  SpecialLectureCount,
} from './models/special-lectures.model'
import { CreateSpecialLecturesModel } from './models/create-special-lectures.model'

enum Table {
  SPECIAL_LECTURES = 'special_lectures',
  SPECIAL_LECTURE_COUNTS = 'special_lectures_count',
  APPLICATIONS = 'applications',
}

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
      `INSERT INTO ${Table.APPLICATIONS} (lecture_id, user_id, applied)
       VALUES ($1, $2, $3)`,
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
      `SELECT user_id, applied, created_at
       FROM ${Table.APPLICATIONS}
       WHERE lecture_id = $1
         AND user_id = $2`,
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
      `SELECT lecture_id, maximum, count
       FROM ${Table.SPECIAL_LECTURE_COUNTS}
       where lecture_id = $1`,
      [lectureId],
    )

    return {
      lectureId,
      maximum: result?.maximum ?? 0,
      count: result?.count ?? 0,
    }
  }

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns Array of Applications (ensuring the order)
   */
  async readAllApplications(
    lectureId: number,
    session?: pgPromise.ITask<unknown>,
  ): Promise<Application[]> {
    const conn = session ?? this.pg

    const result = await conn.many<ApplicationEntity>(
      `SELECT lecture_id, user_id, created_at
       FROM ${Table.APPLICATIONS}
       WHERE lecture_id = $1`,
      [lectureId],
    )

    return result.map<Application>(r => ({
      lectureId: r.lecture_id,
      userId: r.user_id,
      timestamp: r.created_at,
      applied: true,
    }))
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
        /**
         * @todo refactoring
         */
        // await session.none(`LOCK TABLE special_lectures IN EXCLUSIVE MODE`)
        return await atom(session)
      })
    } finally {
      release()
    }
  }

  /**
   *
   * @param model CreateSpecialLecturesModel
   * @param session the session for Transaction
   * @returns SpecialLecture
   */
  async createLecture(
    model: CreateSpecialLecturesModel,
    session?: pgPromise.ITask<unknown>,
  ): Promise<number> {
    const conn = session ?? this.pg

    await conn.none(
      `INSERT INTO ${Table.SPECIAL_LECTURES} (title, opening_date)
       values ($1, $2)`,
      [model.title, model.openingDate],
    )

    const inserted = await conn.one<{ id: number }>(
      `SELECT id
       FROM ${Table.SPECIAL_LECTURES}
       ORDER BY id DESC
       LIMIT 1`,
    )

    await conn.none(
      `INSERT INTO ${Table.SPECIAL_LECTURE_COUNTS} (lecture_id, maximum, count)
       values ($1, $2, $3)`,
      [inserted.id, model.maximum, 0],
    )

    return inserted.id
  }

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns lecture that matches
   */
  async readOneLecture(
    lectureId: number,
    session?: pgPromise.ITask<unknown>,
  ): Promise<SpecialLecture | null> {
    const conn = session ?? this.pg

    const lectureEntity = await conn.oneOrNone<SpecialLectureEntity>(
      `SELECT *
       FROM ${Table.SPECIAL_LECTURES}
       WHERE id = $1`,
      [lectureId],
    )

    return {
      id: lectureEntity.id,
      title: lectureEntity.title,
      openingDate: lectureEntity.opening_date,
    }
  }
}
