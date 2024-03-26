import { SpecialLectureApplicationResult } from './special-lectures.model'

export interface SpecialLecturesRepository {
  /**
   *
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   * @description
   * Internally, use the concept of [JS Set](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Set)
   * to maintain the order of applications while ensuring there are no duplicates.
   */
  pushApplicantIntoLecture(userId: number, session?: unknown): Promise<void>

  /**
   *
   * @param userId  applicant's id for the lecture
   * @param session the session for Transaction
   * @returns the result of the application
   * @throws Error ('Not Applied') if not applied
   */
  readResultOfApplicant(
    userId: number,
    session?: unknown,
  ): Promise<SpecialLectureApplicationResult>

  /**
   *
   * @param session the session for Transaction
   * @returns the number of applicants
   */
  count(session?: unknown): Promise<number>

  /**
   *
   * @param session the session for Transaction
   * @returns applicants (ensuring the order)
   */
  applicants(session?: unknown): Promise<number[]>

  /**
   *
   * @param atom A function that guarantees atomicity
   */
  withLock<T>(atom: (session?: unknown) => Promise<T>): Promise<T>
}
