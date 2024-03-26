import { Module } from '@nestjs/common'
import { EnrollmentController } from './enrollment.controller'
import { EnrollmentService } from './enrollment.service'
import { EnrollmentRepository } from './repository/enrollment.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Enrollment } from './models/enrollment.entities'

@Module({
  imports: [TypeOrmModule.forFeature([Enrollment])],
  controllers: [EnrollmentController],
  providers: [
    EnrollmentService,
    EnrollmentRepository,
    // { provide: 'IEnrollmentRepository', useClass: EnrollmentRepository },
  ],
})
export class EnrollmentModule {}
