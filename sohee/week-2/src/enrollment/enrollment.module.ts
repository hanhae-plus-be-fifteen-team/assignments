import { Module } from '@nestjs/common'
import { EnrollmentController } from './enrollment.controller'
import { EnrollmentService } from './enrollment.service'
import { EnrollmentRepository } from './repository/enrollment.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Enrollment } from './models/enrollment.entities'
import { IENROLLMENT_REPOSITORY } from './repository/enrollment.interface'

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment, EnrollmentRepository])],
  controllers: [EnrollmentController],
  providers: [
    EnrollmentService,
    {
      provide: IENROLLMENT_REPOSITORY,
      useClass: EnrollmentRepository,
    },
  ],
})
export class EnrollmentModule {}
