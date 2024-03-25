import { SpecialLecturesRepository } from './special-lectures.repository'
import { SpecialLectureApplicationResult } from './special-lectures.model'
import { SpecialLecturesService } from './special-lectures.service'

function createRepositoryStub(): SpecialLecturesRepository {
  const db = new Set<number>()

  return {
    pushApplicantIntoLecture(userId: number): Promise<void> {
      db.add(userId)
      return Promise.resolve()
    },
    readResultOfApplicant(
      userId: number,
    ): Promise<SpecialLectureApplicationResult> {
      return Promise.resolve({
        userId,
        applied: db.has(userId),
      })
    },
  }
}

describe('SpecialLecturesService', () => {
  /**
   * (핵심) 특강 신청 API
   */
  describe('Application', () => {
    let service: SpecialLecturesService

    beforeEach(async () => {
      /**
       * stubbing the repository and inject into the service
       */
      service = new SpecialLecturesService(createRepositoryStub())
    })

    it('A user should apply for the lecture', async () => {
      const userId = 1
      const applicationResult = await service.apply(userId)
      expect(applicationResult.userId).toBe(userId)
      expect(applicationResult.applied).toBe(true)
    })
    it.todo('A user should not be able to apply twice or more for the lecture')
    it.todo(
      'A user should not be able to apply if there are already 30 applications',
    )
    /**
     * 동시성 테스트
     */
    it.todo(
      'Applications should be processed sequentially even with concurrent requests',
    )
  })
  /**
   * (기본) 특강 신청 완료 여부 조회 API
   */
  describe('Read the result of the application', () => {
    it.todo('A user should read `applied === true` if the application succeeds')
    it.todo('A user should read `applied === false` if the application fails')
  })
})
