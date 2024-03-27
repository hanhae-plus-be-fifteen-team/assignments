import { ISpecialLecturesRepository } from './special-lectures.repository.interface'
import { SpecialLecturesService } from './special-lectures.service'
import { randomInt } from 'node:crypto'
import { Mutex } from 'async-mutex'
import { Application } from './models/application.model'
import { SpecialLectureCount } from './models/special-lectures.model'

function createRepositoryStub(): ISpecialLecturesRepository {
  const applicationTable = new Map<string, Application>()
  const countTable = new Map<number, SpecialLectureCount>()
  const mutex = new Mutex()

  return {
    pushApplicantIntoLecture(lectureId: number, userId: number): Promise<void> {
      return new Promise(res => {
        setTimeout(() => {
          /**
           * assuming that lecture already created in the stub
           */
          applicationTable.set(`${lectureId}:${userId}`, {
            lectureId,
            userId,
            applied: true,
            timestamp: new Date(),
          })
          countTable.set(lectureId, {
            ...countTable.get(lectureId),
            count: countTable.get(lectureId).count + 1,
          })
          res()
        }, randomInt(50))
      })
    },
    readResultOfApplicant(
      lectureId: number,
      userId: number,
    ): Promise<Application> {
      return new Promise(res => {
        setTimeout(() => {
          /**
           * assuming that lecture already created in the stub
           */
          if (!applicationTable.has(`${lectureId}:${userId}`)) {
            return res({
              lectureId,
              userId,
              applied: false,
              timestamp: null,
            })
          }

          return res({
            lectureId,
            userId,
            applied: applicationTable.get(`${lectureId}:${userId}`).applied,
            timestamp: applicationTable.get(`${lectureId}:${userId}`).timestamp,
          })
        }, randomInt(50))
      })
    },
    count(lectureId: number): Promise<SpecialLectureCount> {
      return new Promise(res => {
        setTimeout(() => {
          /**
           * assuming that lecture already created in the stub
           */
          if (!countTable.has(lectureId)) {
            countTable.set(lectureId, {
              lectureId,
              maximum: 30,
              count: 0,
            })
          }

          res({
            ...countTable.get(lectureId),
            count: countTable.get(lectureId).count ?? 0,
          })
        }, randomInt(50))
      })
    },
    applicants(): Promise<Application[]> {
      return new Promise(res => {
        setTimeout(() => {
          res([...applicationTable.values()])
        }, randomInt(50))
      })
    },
    withLock<T>(atom: (...args: unknown[]) => Promise<T>): Promise<T> {
      // Use the mutex to lock the section
      return mutex.runExclusive(() => atom())
    },
  }
}

describe('SpecialLecturesService', () => {
  /**
   * (핵심) 특강 신청 API
   */
  describe('Application', () => {
    let stub: ISpecialLecturesRepository
    let service: SpecialLecturesService

    beforeEach(async () => {
      /**
       * stubbing the repository and inject into the service
       */
      stub = createRepositoryStub()
      service = new SpecialLecturesService(stub)
    })

    it('A user should apply for the lecture', async () => {
      const lectureId = 1
      const userId = 1
      const applicationResult = await service.applyForLecture(lectureId, userId)
      expect(applicationResult.userId).toBe(userId)
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

      const userId = 31
      expect(service.applyForLecture(lectureId, userId)).rejects.toThrow('Limit Exceeded')
    }, 15000)
    /**
     * 동시성 테스트
     */
    it('Applications should be processed sequentially even with concurrent requests', async () => {
      const lectureId = 1
      // Create users in ascending order
      const users = Array.from({ length: 30 }, (_, i) => i)

      // Sent requests in ascending order of userId.
      const requests = users.map(userId => service.applyForLecture(lectureId, userId))
      await Promise.allSettled(requests)

      // If the sequence is guaranteed, the reservations should be in ascending order of userId.
      const results = await stub.applicants(lectureId)
      expect(results.map(r => r.userId)).toEqual(users)
    })
  })

  /**
   * (기본) 특강 신청 완료 여부 조회 API
   */
  describe('Read the result of the application', () => {
    let stub: ISpecialLecturesRepository
    let service: SpecialLecturesService

    beforeEach(async () => {
      /**
       * stubbing the repository and inject into the service
       */
      stub = createRepositoryStub()
      service = new SpecialLecturesService(stub)
    })

    it('A user should read `applied === true` if the application succeeds', async () => {
      const lectureId = 1
      const userId = 1
      await service.applyForLecture(lectureId, userId)

      const applicationResult = await service.readOneApplication(lectureId, userId)
      expect(applicationResult.applied).toBe(true)
    })
    it('A user should read `applied === false` if the application fails', async () => {
      const lectureId = 1
      const userId = 1

      // mock apply always returns Error
      jest.spyOn(service, 'applyForLecture').mockRejectedValueOnce(new Error())
      expect(service.applyForLecture(lectureId, userId)).rejects.toThrow(Error)

      const applicationResult = await service.readOneApplication(lectureId, userId)
      expect(applicationResult.applied).toBe(false)
    })
  })
})
