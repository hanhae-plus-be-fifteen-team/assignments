import { SpecialLecturesService } from './special-lectures.service'
import { v4 as uuidv4 } from 'uuid'
import {
  initMockRepo,
  setAbnormalAlreadyApplied,
  setAbnormalLimitExceeded,
  setNormalForApplyForLecture,
  setNormalAppliedTrue,
  setNormalAppliedFalse,
} from './mocks/special-lectures.service.mock'

describe('특강 신청 서비스 유닛 테스트', () => {
  let mockRepo: ReturnType<typeof initMockRepo>

  beforeEach(() => {
    mockRepo = initMockRepo()
  })

  describe('(핵심) 특강 신청 API', () => {
    it('A user should apply for the lecture', async () => {
      const lectureId = uuidv4()
      const userId = uuidv4()

      setNormalForApplyForLecture(mockRepo)

      const service = new SpecialLecturesService(mockRepo)

      const applicationResult = await service.applyForLecture(lectureId, userId)
      expect(applicationResult.applied).toBe(true)
    })
    it('A user should not be able to apply twice or more for the lecture', async () => {
      const lectureId = uuidv4()
      const userId = uuidv4()

      setNormalForApplyForLecture(mockRepo)

      const service = new SpecialLecturesService(mockRepo)

      const applicationResult = await service.applyForLecture(lectureId, userId)

      // the first request is ok
      expect(applicationResult.applied).toBe(true)

      setAbnormalAlreadyApplied(mockRepo)

      // the second request is not ok.
      expect(service.applyForLecture(lectureId, userId)).rejects.toThrow(
        'Already Applied',
      )
    })
    it('A user should not be able to apply if there are already 30 applications', async () => {
      const lectureId = uuidv4()

      setNormalForApplyForLecture(mockRepo)

      const service = new SpecialLecturesService(mockRepo)

      /**
       * apply for the lecture 30 times
       */
      await Promise.allSettled(
        Array.from({ length: 30 }, (_, index) =>
          service.applyForLecture(lectureId, uuidv4()),
        ),
      )

      setAbnormalLimitExceeded(mockRepo)

      /**
       * 31'th applicant 😭
       */
      expect(service.applyForLecture(lectureId, uuidv4())).rejects.toThrow(
        'Limit Exceeded',
      )
    }, 15000)
  })

  describe('(기본) 특강 신청 완료 여부 조회 API', () => {
    it('A user should read `applied === true` if the application succeeds', async () => {
      const lectureId = uuidv4()
      const userId = uuidv4()

      setNormalAppliedTrue(mockRepo)

      const service = new SpecialLecturesService(mockRepo)

      await service.applyForLecture(lectureId, userId)

      const applicationResult = await service.readOneApplication(
        lectureId,
        userId,
      )
      // ok!
      expect(applicationResult.applied).toBe(true)
    })

    it('A user should read `applied === false` if the application fails', async () => {
      const lectureId = uuidv4()
      const userId = uuidv4()

      setNormalAppliedFalse(mockRepo)

      const service = new SpecialLecturesService(mockRepo)

      await service.applyForLecture(lectureId, userId)

      const applicationResult = await service.readOneApplication(
        lectureId,
        userId,
      )
      // no!
      expect(applicationResult.applied).toBe(false)
    })
  })
})
