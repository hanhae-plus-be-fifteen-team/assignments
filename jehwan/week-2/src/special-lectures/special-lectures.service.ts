import { ISpecialLecturesRepository } from './special-lectures.repository.interface'
import { Application } from './models/application.model'
import { CreateSpecialLecturesModel } from './models/create-special-lectures.model'
import { SpecialLecture } from './models/special-lectures.model'

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
   * @throws Error 'Lecture Does Not Exist' when there is no matched lecture
   */
  async applyForLecture(
    lectureId: number,
    applicantId: number,
  ): Promise<Application> {
    return this.specialLectureServiceRepository.withLock(async session => {
      const lecture =
        await this.specialLectureServiceRepository.readOneLecture(lectureId)

      if (!lecture) {
        throw new Error('Lecture Does Not Exist')
      }

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
   * @throws Error 'Lecture Does Not Exist' when there is no matched lecture
   **/
  async readOneApplication(
    lectureId: number,
    applicantId: number,
  ): Promise<Application> {
    const lecture =
      await this.specialLectureServiceRepository.readOneLecture(lectureId)

    if (!lecture) {
      throw new Error('Lecture Does Not Exist')
    }

    return await this.specialLectureServiceRepository.readResultOfApplicant(
      lectureId,
      applicantId,
    )
  }

  /**
   *
   * @param createModel
   * @returns SpecialLecture that created
   */
  async createLecture(
    createModel: CreateSpecialLecturesModel,
  ): Promise<SpecialLecture> {
    return this.specialLectureServiceRepository.withLock(async session => {
      const insertedId =
        await this.specialLectureServiceRepository.createLecture(
          createModel,
          session,
        )
      return await this.specialLectureServiceRepository.readOneLecture(
        insertedId,
        session,
      )
    })
  }
}
