import { ISpecialLecturesRepository } from './special-lectures.repository.interface'
import { SpecialLecturesService } from './special-lectures.service'
import { createRepositoryStub } from './stubs/repository.stub'

describe('신청 API', () => {
  describe('(핵심) 특강 신청 API', () => {
    let stub: ISpecialLecturesRepository
    let service: SpecialLecturesService

    beforeEach(async () => {
      /**
       * stubbing the repository and inject into the service
       */
      stub = createRepositoryStub()
      service = new SpecialLecturesService(stub)

      /**
       * create a lecture stub for each test
       */
      await stub.createLecture({
        title: '대기업 이직 일격필살',
        openingDate: new Date(),
        maximum: 30,
      })
    })

    it('A user should apply for the lecture', async () => {
      const lectureId = 1
      const userId = 1

      // applying succeeds
      const applicationResult = await service.applyForLecture(lectureId, userId)
      expect(applicationResult.userId).toBe(userId)
      // ok!
      expect(applicationResult.applied).toBe(true)
    })
    it('A user should not be able to apply twice or more for the lecture', async () => {
      const lectureId = 1
      const userId = 1
      const applicationResult = await service.applyForLecture(lectureId, userId)

      // the first request is ok
      expect(applicationResult.applied).toBe(true)

      // the second request is not ok.
      expect(service.applyForLecture(lectureId, userId)).rejects.toThrow(
        'Already Applied',
      )
    })
    it('A user should not be able to apply if there are already 30 applications', async () => {
      const lectureId = 1
      for (let userId = 1; userId <= 30; userId++) {
        await service.applyForLecture(lectureId, userId)
      }

      /**
       * 31'th applicant 😭
       */
      const userId = 31
      expect(service.applyForLecture(lectureId, userId)).rejects.toThrow(
        'Limit Exceeded',
      )
    }, 15000)
    /**
     * 동시성 테스트
     */
    it('Applications should be processed sequentially even with concurrent requests', async () => {
      const lectureId = 1
      // Create users in ascending order
      const users = Array.from({ length: 30 }, (_, i) => i)

      // Sent requests in ascending order of userId.
      const requests = users.map(userId =>
        service.applyForLecture(lectureId, userId),
      )

      // race! 🚗
      await Promise.allSettled(requests)

      // If the sequence is guaranteed, the reservations should be in ascending order of userId.
      const results = await stub.readAllApplications(lectureId)
      expect(results.map(r => r.userId)).toEqual(users)
    })
  })

  describe('(기본) 특강 신청 완료 여부 조회 API', () => {
    let stub: ISpecialLecturesRepository
    let service: SpecialLecturesService

    beforeEach(async () => {
      /**
       * stubbing the repository and inject into the service
       */
      stub = createRepositoryStub()
      service = new SpecialLecturesService(stub)

      /**
       * create a lecture stub for each test
       */
      await stub.createLecture({
        title: '대기업 면접 일격필살',
        openingDate: new Date(),
        maximum: 30,
      })
    })

    it('A user should read `applied === true` if the application succeeds', async () => {
      const lectureId = 1
      const userId = 1
      // applying succeeds
      await service.applyForLecture(lectureId, userId)

      const applicationResult = await service.readOneApplication(
        lectureId,
        userId,
      )
      // ok!
      expect(applicationResult.applied).toBe(true)
    })
    it('A user should read `applied === false` if the application fails', async () => {
      const lectureId = 1
      const userId = 1

      // mock apply always returns Error
      jest.spyOn(service, 'applyForLecture').mockRejectedValueOnce(new Error())
      expect(service.applyForLecture(lectureId, userId)).rejects.toThrow(Error)

      const applicationResult = await service.readOneApplication(
        lectureId,
        userId,
      )

      // no applied!
      expect(applicationResult.applied).toBe(false)
    })
  })
})
