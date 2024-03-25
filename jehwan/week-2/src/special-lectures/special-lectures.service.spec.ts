import { SpecialLecturesRepository } from './special-lectures.repository'
import { SpecialLectureApplicationResult } from './special-lectures.model'
import { SpecialLecturesService } from './special-lectures.service'
import { randomInt } from 'node:crypto'

function createRepositoryStub(): SpecialLecturesRepository {
  const db = new Set<number>()

  return {
    pushApplicantIntoLecture(userId: number): Promise<void> {
      return new Promise(res => {
        setTimeout(() => {
          db.add(userId)
          res()
        }, randomInt(50))
      })
    },
    readResultOfApplicant(
      userId: number,
    ): Promise<SpecialLectureApplicationResult> {
      return new Promise(res => {
        setTimeout(() => {
          res({
            userId,
            applied: db.has(userId),
          })
        }, randomInt(50))
      })
    },
    count(): Promise<number> {
      return new Promise(res => {
        setTimeout(() => {
          res(db.size)
        }, randomInt(50))
      })
    },
    applicants(): Promise<number[]> {
      return new Promise(res => {
        setTimeout(() => {
          res([...db])
        }, randomInt(50))
      })
    },
  }
}

describe('SpecialLecturesService', () => {
  /**
   * (핵심) 특강 신청 API
   */
  describe('Application', () => {
    let stub: SpecialLecturesRepository
    let service: SpecialLecturesService

    beforeEach(async () => {
      /**
       * stubbing the repository and inject into the service
       */
      stub = createRepositoryStub()
      service = new SpecialLecturesService(stub)
    })

    it('A user should apply for the lecture', async () => {
      const userId = 1
      const applicationResult = await service.apply(userId)
      expect(applicationResult.userId).toBe(userId)
      expect(applicationResult.applied).toBe(true)
    })
    it('A user should not be able to apply twice or more for the lecture', async () => {
      const userId = 1
      const applicationResult = await service.apply(userId)

      // the first request is ok
      expect(applicationResult.applied).toBe(true)

      // the second request is not ok.
      expect(service.apply(userId)).rejects.toThrow('Already Applied')
    })
    it('A user should not be able to apply if there are already 30 applications', async () => {
      for (let i = 1; i <= 30; i++) {
        await service.apply(i)
      }

      const userId = 31
      expect(service.apply(userId)).rejects.toThrow('Limit Exceeded')
    }, 15000)
    /**
     * 동시성 테스트
     */
    it('Applications should be processed sequentially even with concurrent requests', async () => {
      // Create users in ascending order
      const users = Array.from({ length: 30 }, (_, i) => i)

      // Sent requests in ascending order of userId.
      const requests = users.map(userId => service.apply(userId))
      await Promise.allSettled(requests)

      // If the sequence is guaranteed, the reservations should be in ascending order of userId.
      expect(await stub.applicants()).toEqual(users)
    })
  })
  /**
   * (기본) 특강 신청 완료 여부 조회 API
   */
  describe('Read the result of the application', () => {
    it.todo('A user should read `applied === true` if the application succeeds')
    it.todo('A user should read `applied === false` if the application fails')
  })
})
