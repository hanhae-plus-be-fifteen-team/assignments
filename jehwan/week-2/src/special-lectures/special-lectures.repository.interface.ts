import { Application } from './models/application.model'
import {
  SpecialLecture,
  SpecialLectureCount,
} from './models/special-lecture.model'
import { CreateSpecialLectureModel } from './models/create-special-lecture.model'

export interface ISpecialLecturesRepository {
  /**
   *
   * @param model CreateSpecialLectureModel
   * @param session the session for Transaction
   * @returns lecture's id that created
   */
  createLecture(
    model: CreateSpecialLectureModel,
    session?: unknown,
  ): Promise<SpecialLecture>

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns SpecialLecture or null
   */
  readOneLecture(
    lectureId: string,
    session?: unknown,
  ): Promise<SpecialLecture | null>

  /**
   *
   * @param session the session for Transaction
   * @returns All SpecialLecture
   */
  readAllLectures(session?: unknown): Promise<SpecialLecture[]>

  /**
   *
   * @param lectureId lecture's id
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   */
  createApplication(
    lectureId: string,
    userId: string,
    session?: unknown,
  ): Promise<void>

  /**
   *
   * @param lectureId lecture's id
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   * @returns the result of the application
   */
  readOneApplication(
    lectureId: string,
    userId: string,
    session?: unknown,
  ): Promise<Application>

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns Array of Applications (ensuring the order)
   */
  readAllApplications(
    lectureId: string,
    session?: unknown,
  ): Promise<Application[]>

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns the number of applicants
   */
  readCount(lectureId: string, session?: unknown): Promise<SpecialLectureCount>

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns the number of applicants
   * @description add count +1
   */
  addCount(lectureId: string, session?: unknown): Promise<SpecialLectureCount>

  /**
   *
   * @param atom A function that guarantees atomicity
   */
  withLock<T>(atom: (session?: unknown) => Promise<T>): Promise<T>
}
