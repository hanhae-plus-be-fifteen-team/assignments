import { ISpecialLecturesRepository } from './special-lectures.repository.interface'
import { createDb } from '../database'
import pgPromise from 'pg-promise'
import {
  SpecialLectureCountEntity,
  SpecialLectureEntity,
} from './entities/special-lectures.entity'
import { ApplicationEntity } from './entities/application.entity'
import { Application } from './models/application.model'
import {
  SpecialLecture,
  SpecialLectureCount,
} from './models/special-lecture.model'
import { CreateSpecialLectureModel } from './models/create-special-lecture.model'

enum Table {
  SPECIAL_LECTURES = 'special_lectures',
  SPECIAL_LECTURE_COUNTS = 'special_lectures_count',
  APPLICATIONS = 'applications',
}

export class SpecialLecturesRepositoryImpl
  implements ISpecialLecturesRepository
{
  private readonly pg: pgPromise.IDatabase<unknown>

  constructor() {
    this.pg = createDb()
  }

  /**
   *
   * @param lectureId lecture's id
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   */
  async createApplication(
    lectureId: string,
    userId: string,
    session?: pgPromise.ITask<unknown>,
  ): Promise<void> {
    const conn = session ?? this.pg

    await conn.none(
      `INSERT INTO ${Table.APPLICATIONS} (lecture_id, user_id)
       VALUES ($1, $2)`,
      [lectureId, userId],
    )
  }

  /**
   *
   * @param lectureId lecture's id
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   * @returns Business Domain Model (SpecialLectureApplicationResult)
   */
  async readOneApplication(
    lectureId: string,
    userId: string,
    session?: pgPromise.ITask<unknown>,
  ): Promise<Application> {
    const conn = session ?? this.pg

    const applicationEntity = await conn.oneOrNone<ApplicationEntity>(
      `SELECT *
       FROM ${Table.APPLICATIONS}
       WHERE lecture_id = $1
         AND user_id = $2`,
      [lectureId, userId],
    )

    return {
      id: applicationEntity?.id ?? null,
      lectureId: lectureId,
      userId: userId,
      applied: !!applicationEntity,
      timestamp: applicationEntity?.created_at ?? null,
    }
  }

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns count for the lecture
   */
  async readCount(
    lectureId: string,
    session?: pgPromise.ITask<unknown>,
  ): Promise<SpecialLectureCount> {
    const conn = session ?? this.pg

    const countEntity = await conn.oneOrNone<SpecialLectureCountEntity>(
      `SELECT lecture_id, maximum, count
       FROM ${Table.SPECIAL_LECTURE_COUNTS}
       where lecture_id = $1`,
      [lectureId],
    )

    return {
      id: countEntity.id,
      lectureId: countEntity.lecture_id,
      maximum: countEntity?.maximum ?? 0,
      count: countEntity?.count ?? 0,
    }
  }

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns Array of Applications (ensuring the order)
   */
  async readAllApplications(
    lectureId: string,
    session?: pgPromise.ITask<unknown>,
  ): Promise<Application[]> {
    const conn = session ?? this.pg

    const applicationEntities = await conn.many<ApplicationEntity>(
      `SELECT lecture_id, user_id, created_at
       FROM ${Table.APPLICATIONS}
       WHERE lecture_id = $1`,
      [lectureId],
    )

    return applicationEntities.map<Application>(entity => ({
      id: entity.id,
      lectureId: entity.lecture_id,
      userId: entity.user_id,
      timestamp: entity.created_at,
      applied: true,
    }))
  }

  /**
   *
   * @param lectureId lock based on lectureId
   * @param atom A function that guarantees atomicity
   * @returns the result of atom()
   */
  async withLock<T>(
    lectureId: string,
    atom: (session?: pgPromise.ITask<unknown>) => Promise<T>,
  ): Promise<T> {
    return await this.pg.tx<T>(async session => {
      // Lock the 'special_lectures_count' table based on lectureId in EXCLUSIVE MODE
      await session.any(
        `SELECT *
         FROM ${Table.SPECIAL_LECTURE_COUNTS}
         WHERE lecture_id = $1 FOR UPDATE`,
        [lectureId],
      )
      return atom(session)
    })
  }

  /**
   *
   * @param model CreateSpecialLectureModel
   * @param session the session for Transaction
   * @returns SpecialLecture
   */
  async createLecture(
    model: CreateSpecialLectureModel,
    session?: pgPromise.ITask<unknown>,
  ): Promise<SpecialLecture> {
    const conn = session ?? this.pg

    await conn.none(
      `INSERT INTO ${Table.SPECIAL_LECTURES} (title, opening_date)
       values ($1, $2)`,
      [model.title, model.openingDate],
    )

    const inserted = await conn.one<SpecialLecture>(
      `SELECT *
       FROM ${Table.SPECIAL_LECTURES}
       ORDER BY created_at DESC
       LIMIT 1`,
    )

    await conn.none(
      `INSERT INTO ${Table.SPECIAL_LECTURE_COUNTS} (lecture_id, maximum, count)
       values ($1, $2, $3)`,
      [inserted.id, model.maximum, 0],
    )

    return inserted
  }

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns lecture that matches
   */
  async readOneLecture(
    lectureId: string,
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

  /**
   *
   * @param session the session for Transaction
   * @returns all lectures
   */
  async readAllLectures(
    session?: pgPromise.ITask<unknown>,
  ): Promise<SpecialLecture[]> {
    const conn = session ?? this.pg

    const lecturesEntities = await conn.many<SpecialLectureEntity>(`SELECT *
                                                                    FROM ${Table.SPECIAL_LECTURES}`)

    return lecturesEntities.map(entity => ({
      id: entity.id,
      title: entity.title,
      openingDate: entity.opening_date,
    }))
  }

  async addCount(
    lectureId: string,
    session?: pgPromise.ITask<unknown>,
  ): Promise<SpecialLectureCount> {
    const conn = session ?? this.pg

    await conn.none(
      `UPDATE ${Table.SPECIAL_LECTURE_COUNTS}
       set count = count + 1
       WHERE lecture_id = $1`,
      [lectureId],
    )

    const countEntity = await conn.one<SpecialLectureCountEntity>(
      `SELECT *
       FROM ${Table.SPECIAL_LECTURE_COUNTS}
       WHERE lecture_id = $1`,
      [lectureId],
    )

    return {
      id: countEntity.id,
      lectureId: countEntity.lecture_id,
      maximum: countEntity.maximum,
      count: countEntity.count,
    }
  }
}
