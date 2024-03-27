import { ISpecialLecturesRepository } from '../special-lectures.repository.interface'

/**
 * @description initialize mock repository
 */
export function initMockRepo(): Record<
  keyof ISpecialLecturesRepository,
  jest.Mock
> {
  return {
    createLecture: jest.fn(),
    createApplication: jest.fn(),
    readAllLectures: jest.fn(),
    readAllApplications: jest.fn(),
    readOneLecture: jest.fn(),
    readOneApplication: jest.fn(),
    count: jest.fn(),
    withLock: jest.fn(),
  }
}

/**
 *
 * @param mockRepo
 * @description set normal
 */
export function setNormalForApplyForLecture(
  mockRepo: ReturnType<typeof initMockRepo>,
) {
  mockRepo.readOneLecture.mockReturnValue({})
  mockRepo.withLock.mockImplementation(atom => atom())
  mockRepo.count.mockReturnValue({
    maximum: 30,
    count: 0,
  })
  mockRepo.readOneApplication
    .mockReturnValueOnce({
      applied: false,
    })
    .mockReturnValueOnce({
      applied: true,
    })
}

/**
 *
 * @param mockRepo
 * @description set AlreadyApplied
 */
export function setAbnormalAlreadyApplied(
  mockRepo: ReturnType<typeof initMockRepo>,
) {
  mockRepo.readOneLecture.mockReturnValue({})
  mockRepo.withLock.mockImplementation(atom => atom())
  mockRepo.count.mockReturnValue({
    maximum: 30,
    count: 0,
  })
  mockRepo.readOneApplication.mockReturnValue({
    applied: true,
  })
}

/**
 *
 * @param mockRepo
 * @description set LimitExceeded
 */
export function setAbnormalLimitExceeded(
  mockRepo: ReturnType<typeof initMockRepo>,
) {
  mockRepo.readOneLecture.mockReturnValue({})
  mockRepo.withLock.mockImplementation(atom => atom())
  mockRepo.count.mockReturnValue({
    maximum: 30,
    count: 31,
  })
}

export function setNormalAppliedTrue(
  mockRepo: ReturnType<typeof initMockRepo>,
) {
  mockRepo.readOneLecture.mockReturnValue({})
  mockRepo.readOneApplication.mockReturnValue({
    applied: true,
  })
}

export function setNormalAppliedFalse(
  mockRepo: ReturnType<typeof initMockRepo>,
) {
  mockRepo.readOneLecture.mockReturnValue({})
  mockRepo.readOneApplication.mockReturnValue({
    applied: false,
  })
}
