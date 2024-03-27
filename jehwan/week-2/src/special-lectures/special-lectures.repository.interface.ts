import { Application, SpecialLectureCount } from './special-lectures.model'

export interface ISpecialLecturesRepository {
  /**
   *
   * @param lectureId lecture's id
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
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
   */
  count(lectureId: number, session?: unknown): Promise<SpecialLectureCount>

  /**
   *
   * @param lectureId lecture's id
   * @param session the session for Transaction
   * @returns applicants (ensuring the order)
   */
  applicants(lectureId: number, session?: unknown): Promise<Application[]>

  /**
   *
   * @param atom A function that guarantees atomicity
   */
  withLock<T>(atom: (session?: unknown) => Promise<T>): Promise<T>
}