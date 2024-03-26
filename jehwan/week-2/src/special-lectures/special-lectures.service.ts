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
    return this.specialLectureServiceRepository.withLock(async session => {
      const count = await this.specialLectureServiceRepository.count(session)

      if (count >= 30) {
        throw new Error('Limit Exceeded')
      }

      const prevResult =
        await this.specialLectureServiceRepository.readResultOfApplicant(
          applicantId,
          session,
        )

      if (prevResult.applied) {
        throw new Error('Already Applied')
      }

      await this.specialLectureServiceRepository.pushApplicantIntoLecture(
        applicantId,
        session,
      )

      return this.specialLectureServiceRepository.readResultOfApplicant(
        applicantId,
        session,
      )
    })
  }

  /**
   *
   * @param applicantId - applicant's id for the lecture
   * @returns the result of the application
   */
  async read(applicantId: number): Promise<SpecialLectureApplicationResult> {
    try {
      return await this.specialLectureServiceRepository.readResultOfApplicant(
        applicantId,
      )
    } catch (e) {
      if (e.message === 'Not Applied') {
        return {
          userId: applicantId,
          applied: false,
        }
      }
      throw e
    }
  }
}
