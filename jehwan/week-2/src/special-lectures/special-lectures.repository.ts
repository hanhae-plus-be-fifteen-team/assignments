import { SpecialLectureApplicationResult } from './special-lectures.model'

export interface SpecialLecturesRepository {
  /**
   *
   * @param userId  applicant's id for the lecture
   * @description
   * Internally, use the concept of [JS Set](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Set)
   * to maintain the order of applications while ensuring there are no duplicates.
   */
  pushApplicantIntoLecture(userId: number): Promise<void>

  /**
   *
   * @param userId  applicant's id for the lecture
   * @returns the result of the application
   */
  readResultOfApplicant(
    userId: number,
  ): Promise<SpecialLectureApplicationResult>

  /**
   *
   * @returns the number of applicants
   */
  count(): Promise<number>
}
