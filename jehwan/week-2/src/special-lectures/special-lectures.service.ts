import { ISpecialLecturesRepository } from './special-lectures.repository.interface'
import { Application } from './models/application.model'

export class SpecialLecturesService {
  constructor(
    private readonly specialLectureServiceRepository: ISpecialLecturesRepository,
  ) {}

  /**
   * @param lectureId lecture's id
   * @param applicantId - applicant's id for the lecture
   * @returns the result of the application
   * @throws Error 'Limit Exceeded' when count >= 30
   * @throws Error 'Already Applied' when applied === true
   */
  async applyForLecture(
    lectureId: number,
    applicantId: number,
  ): Promise<Application> {
    return this.specialLectureServiceRepository.withLock(async session => {
      const countResult = await this.specialLectureServiceRepository.count(
        lectureId,
        session,
      )

      if (countResult.count >= countResult.maximum) {
        throw new Error('Limit Exceeded')
      }

      const prevResult =
        await this.specialLectureServiceRepository.readResultOfApplicant(
          lectureId,
          applicantId,
          session,
        )

      if (prevResult.applied) {
        throw new Error('Already Applied')
      }

      await this.specialLectureServiceRepository.pushApplicantIntoLecture(
        lectureId,
        applicantId,
        session,
      )

      return this.specialLectureServiceRepository.readResultOfApplicant(
        lectureId,
        applicantId,
        session,
      )
    })
  }

  /**
   *
   * @param lectureId lecture's id
   * @param applicantId - applicant's id for the lecture
   * @returns user's application result
   **/
  async readOneApplication(
    lectureId: number,
    applicantId: number,
  ): Promise<Application> {
    return await this.specialLectureServiceRepository.readResultOfApplicant(
      lectureId,
      applicantId,
    )
  }
}
