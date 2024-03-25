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
  async apply(applicantId: number): Promise<SpecialLectureApplicationResult> {
    const prevResult =
      await this.specialLectureServiceRepository.readResultOfApplicant(
        applicantId,
      )

    if (prevResult.applied) {
      throw new Error('Already Applied')
    }

    await this.specialLectureServiceRepository.pushApplicantIntoLecture(
      applicantId,
    )

    return this.specialLectureServiceRepository.readResultOfApplicant(
      applicantId,
    )
  }

  /**
   *
   * @param applicantId - applicant's id for the lecture
   * @returns the result of the application
   */
  async read(applicantId: number): Promise<SpecialLectureApplicationResult> {
    return {
      userId: 0,
      applied: false,
    }
  }
}
