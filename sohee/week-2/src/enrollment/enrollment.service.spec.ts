import { Test, TestingModule } from '@nestjs/testing'
import { EnrollmentService } from './enrollment.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EnrollmentController } from './enrollment.controller'
import { Enrollment } from './models/enrollment.entities'
import { EnrollmentRepository } from './repository/enrollment.repository'

describe('EnrollmentService', () => {
  let service: EnrollmentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([Enrollment, EnrollmentRepository])],
      controllers: [EnrollmentController],
      providers: [EnrollmentService, EnrollmentRepository],
    }).compile()

    service = module.get<EnrollmentService>(EnrollmentService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
