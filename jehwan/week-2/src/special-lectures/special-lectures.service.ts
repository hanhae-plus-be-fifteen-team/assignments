import { ISpecialLecturesRepository } from './special-lectures.repository.interface'
import { Application } from './models/application.model'
import { CreateSpecialLectureModel } from './models/create-special-lecture.model'
import { SpecialLecture } from './models/special-lecture.model'
import {
  SpecialLectureException,
  SpecialLectureExceptionMessage,
} from './models/special-lecture.excpetion.model'

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
   * @throws Error 'Not Open Yet' when current time is before the openingDate
   */
  async applyForLecture(
    lectureId: string,
    applicantId: string,
  ): Promise<Application> {
    return this.specialLectureServiceRepository.withLock(async session => {
      const lecture =
        await this.specialLectureServiceRepository.readOneLecture(lectureId)

      if (!lecture) {
        throw new SpecialLectureException(
          SpecialLectureExceptionMessage.LECTURE_DOES_NOT_EXIST,
        )
      }

      if (new Date() < lecture.openingDate) {
        throw new SpecialLectureException(
          SpecialLectureExceptionMessage.NOT_OPEN_YET,
        )
      }

      const countResult = await this.specialLectureServiceRepository.readCount(
        lectureId,
        session,
      )

      if (countResult.count >= countResult.maximum) {
        throw new SpecialLectureException(
          SpecialLectureExceptionMessage.LIMIT_EXCEEDED,
        )
      }

      const prevResult =
        await this.specialLectureServiceRepository.readOneApplication(
          lectureId,
          applicantId,
          session,
        )

      if (prevResult.applied) {
        throw new SpecialLectureException(
          SpecialLectureExceptionMessage.ALREADY_APPLIED,
        )
      }

      await this.specialLectureServiceRepository.createApplication(
        lectureId,
        applicantId,
        session,
      )

      await this.specialLectureServiceRepository.addCount(lectureId, session)

      return this.specialLectureServiceRepository.readOneApplication(
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
    lectureId: string,
    applicantId: string,
  ): Promise<Application> {
    const lecture =
      await this.specialLectureServiceRepository.readOneLecture(lectureId)

    if (!lecture) {
      throw new Error('Lecture Does Not Exist')
    }

    return await this.specialLectureServiceRepository.readOneApplication(
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
    createModel: CreateSpecialLectureModel,
  ): Promise<SpecialLecture> {
    return this.specialLectureServiceRepository.createLecture(createModel)
  }

  /**
   *
   * @param lectureId lecture's id
   * @returns all applications for the lecture
   * @throws Error 'Lecture Does Not Exist' when there is no matched lecture
   **/
  async readAllApplications(lectureId: string): Promise<Application[]> {
    const lecture =
      await this.specialLectureServiceRepository.readOneLecture(lectureId)

    if (!lecture) {
      throw new SpecialLectureException(
        SpecialLectureExceptionMessage.LECTURE_DOES_NOT_EXIST,
      )
    }

    return this.specialLectureServiceRepository.readAllApplications(lectureId)
  }

  /**
   *
   * @returns all lectures
   **/
  readAllLectures(): Promise<SpecialLecture[]> {
    return this.specialLectureServiceRepository.readAllLectures()
  }
}
