import { ISpecialLecturesRepository } from './special-lectures.repository.interface'
import { SpecialLecturesService } from './special-lectures.service'
import { randomInt } from 'node:crypto'
import { Mutex } from 'async-mutex'
import { Application } from './models/application.model'
import {
  SpecialLecture,
  SpecialLectureCount,
} from './models/special-lectures.model'
import { CreateSpecialLecturesModel } from './models/create-special-lectures.model'

function createRepositoryStub(): ISpecialLecturesRepository {
  let serial = 0
  const lectureTable = new Map<number, SpecialLecture>()
  const applicationTable = new Map<string, Application>()
  const countTable = new Map<number, SpecialLectureCount>()
  const mutex = new Mutex()

  return {
    pushApplicantIntoLecture(lectureId: number, userId: number): Promise<void> {
      return new Promise((res, rej) => {
        setTimeout(() => {
          if (!lectureTable.has(lectureId)) return rej('LECTURE DOES NOT EXIST')

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
      return new Promise((res, rej) => {
        setTimeout(() => {
          if (!lectureTable.has(lectureId)) return rej('LECTURE DOES NOT EXIST')

          const key = `${lectureId}:${userId}`
          const application = applicationTable.get(key)

          return res({
            lectureId,
            userId,
            applied: application?.applied ?? false,
            timestamp: application?.timestamp ?? null,
          })
        }, randomInt(50))
      })
    },
    count(lectureId: number): Promise<SpecialLectureCount> {
      return new Promise((res, rej) => {
        setTimeout(() => {
          if (!lectureTable.has(lectureId)) return rej('LECTURE DOES NOT EXIST')

          res({
            ...countTable.get(lectureId),
            count: countTable.get(lectureId).count ?? 0,
          })
        }, randomInt(50))
      })
    },
    readAllApplications(lectureId: number): Promise<Application[]> {
      return new Promise((res, rej) => {
        if (!lectureTable.has(lectureId)) return rej('LECTURE DOES NOT EXIST')

        setTimeout(() => {
          res([...applicationTable.values()])
        }, randomInt(50))
      })
    },
    createLecture(model: CreateSpecialLecturesModel): Promise<SpecialLecture> {
      return new Promise(res => {
        setTimeout(() => {
          lectureTable.set(++serial, {
            id: serial,
            title: model.title,
            openingDate: model.openingDate,
          })

          countTable.set(serial, {
            lectureId: serial,
            maximum: model.maximum,
            count: 0,
          })

          res(lectureTable.get(serial))
        }, randomInt(50))
      })
    },
    withLock<T>(atom: (...args: unknown[]) => Promise<T>): Promise<T> {
      // Use the mutex to lock the section
      return mutex.runExclusive(() => atom())
    },
  }
}

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
    })

    it('A user should read `applied === true` if the application succeeds', async () => {
      const lectureId = 1
      const userId = 1
      await service.applyForLecture(lectureId, userId)

      const applicationResult = await service.readOneApplication(
        lectureId,
        userId,
      )
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
      expect(applicationResult.applied).toBe(false)
    })
  })
})
