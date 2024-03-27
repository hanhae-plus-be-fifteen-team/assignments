import { Application } from './models/application.model'
import {
  SpecialLecture,
  SpecialLectureCount,
} from './models/special-lectures.model'
import { CreateSpecialLecturesModel } from './models/create-special-lectures.model'

export interface ISpecialLecturesRepository {
  /**
   *
   * @param lectureId lecture's id
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   * @throws Error 'LECTURE DOES NOT EXIST' when lecture does not match
   * @description
   * Internally, use the concept of [JS Set](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Set)
   * to maintain the order of applications while ensuring there are no duplicates.
   */
  pushApplicantIntoLecture(
    lectureId: number,
    userId: number,
    session?: unknown,
  ): Promise<void>

  /**
   *
   * @param lectureId lecture's id
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   * @returns the result of the application
   * @throws Error 'LECTURE DOES NOT EXIST' when lecture does not match
   */
  readResultOfApplicant(
    lectureId: number,
    userId: number,
    session?: unknown,
  ): Promise<Application>

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns the number of applicants
   * @throws Error 'LECTURE DOES NOT EXIST' when lecture does not match
   */
  count(lectureId: number, session?: unknown): Promise<SpecialLectureCount>

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns Array of Applications (ensuring the order)
   * @throws Error 'LECTURE DOES NOT EXIST' when lecture does not match
   */
  readAllApplications(
    lectureId: number,
    session?: unknown,
  ): Promise<Application[]>

  /**
   *
   * @param model CreateSpecialLecturesModel
   * @returns SpecialLecture
   */
  createLecture(model: CreateSpecialLecturesModel): Promise<SpecialLecture>

  /**
   *
   * @param atom A function that guarantees atomicity
   */
  withLock<T>(atom: (session?: unknown) => Promise<T>): Promise<T>
}
