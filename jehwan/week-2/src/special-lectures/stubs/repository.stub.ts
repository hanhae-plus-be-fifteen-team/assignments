import { ISpecialLecturesRepository } from '../special-lectures.repository.interface'
import {
  SpecialLecture,
  SpecialLectureCount,
} from '../models/special-lectures.model'
import { Application } from '../models/application.model'
import { Mutex } from 'async-mutex'
import { randomInt } from 'node:crypto'
import { CreateSpecialLecturesModel } from '../models/create-special-lectures.model'

export function createRepositoryStub(): ISpecialLecturesRepository {
  let serial = 0
  const lectureTable = new Map<number, SpecialLecture>()
  const applicationTable = new Map<string, Application>()
  const countTable = new Map<number, SpecialLectureCount>()
  const mutex = new Mutex()

  return {
    pushApplicantIntoLecture(lectureId: number, userId: number): Promise<void> {
      return new Promise(res => {
        setTimeout(() => {
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
      return new Promise(res => {
        setTimeout(() => {
          res({
            ...countTable.get(lectureId),
            count: countTable.get(lectureId).count ?? 0,
          })
        }, randomInt(50))
      })
    },
    readAllApplications(lectureId: number): Promise<Application[]> {
      return new Promise(res => {
        setTimeout(() => {
          res([...applicationTable.values()])
        }, randomInt(50))
      })
    },
    createLecture(model: CreateSpecialLecturesModel): Promise<number> {
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

          res(serial)
        }, randomInt(50))
      })
    },
    withLock<T>(atom: (...args: unknown[]) => Promise<T>): Promise<T> {
      // Use the mutex to lock the section
      return mutex.runExclusive(() => atom())
    },
    readOneLecture(lectureId: number): Promise<SpecialLecture | null> {
      return new Promise(res => {
        setTimeout(() => {
          res(lectureTable.get(lectureId) ?? null)
        }, randomInt(50))
      })
    },
  }
}
