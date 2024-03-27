import { Test, TestingModule } from '@nestjs/testing'
import { EnrollmentService } from './enrollment.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EnrollmentController } from './enrollment.controller'
import { Enrollment } from './models/enrollment.entities'
import { IENROLLMENT_REPOSITORY } from './repository/enrollment.interface'
import { EnrollmentTable } from '../database/enrollment.table'
import { FakeRepository } from './repository/fake.repository'
import { EnrollResult } from './models/enrollment.result'

describe('EnrollmentService', () => {
  let service: EnrollmentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Enrollment, FakeRepository])],
      controllers: [EnrollmentController],
      providers: [
        EnrollmentService,
        {
          provide: IENROLLMENT_REPOSITORY,
          useClass: FakeRepository,
        },
        EnrollmentTable,
      ],
    }).compile()

    service = module.get<EnrollmentService>(EnrollmentService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // user가 등록한 class에 대해 조회한다
  describe('get classes', () => {
    const studentId = 'studentA'
    it('empty classes', async () => {
      const result = await service.getClasses(studentId)
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(0)
    })

    it('success to get classes', async () => {
      await service.enroll(studentId, 55)
      await service.enroll(studentId, 44)
      await service.enroll(studentId, 66)
      const result = await service.getClasses(studentId)
      expect(result.length).toBe(3)
      expect(result).toEqual([55, 44, 66])
    })

    // todo : 존재하지 않는 studentId
  })

  // enroll에 대해 test한다.
  describe('enroll', () => {
    it('success with new id', async () => {
      const studentId = 'A'
      const classId = 77
      const result = await service.enroll(studentId, classId)
      expect(result).toEqual(EnrollResult.Success)
    })

    it('result with duplicated id', async () => {
      const studentId = 'A'
      const classId = 77
      await service.enroll(studentId, classId)

      // 같은 id, class로 재시도한다.
      const result = await service.enroll(studentId, classId)
      expect(result).toEqual(EnrollResult.AlreadyEnrolled)
    })

    it('result with closed class', async () => {
      const classId = 77
      for (let i; i < 30; i++) {
        const studentId = `student_${i}`
        await service.enroll(studentId, classId)
      }

      // 30명이 이미 등록한 경우의 return
      const newId = 'student_30'
      const result = await service.enroll(newId, classId)
      expect(result).toEqual(EnrollResult.Closed)
    })

    // todo : 존재하지 않는 강좌 신청
    // 강좌 등록 필요
  })
})
