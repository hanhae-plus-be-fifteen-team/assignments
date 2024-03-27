import { Test, TestingModule } from '@nestjs/testing'
import { EnrollmentService } from './enrollment.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EnrollmentController } from './enrollment.controller'
import { Enrollment } from './models/enrollment.entities'
import { IENROLLMENT_REPOSITORY } from './repository/enrollment.interface'
import { EnrollmentTable } from '../database/enrollment.table'
import { FakeRepository } from './repository/fake.repository'

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
})
