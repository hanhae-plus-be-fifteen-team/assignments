import { SpecialLectureApplicationResult } from './special-lectures.model'
import { SpecialLecturesRepository } from './special-lectures.repository'

export class SpecialLecturesService {
  constructor(
    private readonly specialLectureServiceRepository: SpecialLecturesRepository,
  ) {}

  /**
   *
   * @param applicantId - applicant's id for the lecture
   * @returns the result of the application
   */
  apply(applicantId: number): Promise<SpecialLectureApplicationResult> {
    return
  }

  /**
   *
   * @param applicantId - applicant's id for the lecture
   * @returns the result of the application
   */
  read(applicantId: number): Promise<SpecialLectureApplicationResult> {
    return
  }
}
