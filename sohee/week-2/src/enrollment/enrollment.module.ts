import { Module } from '@nestjs/common'
import { EnrollmentController } from './enrollment.controller'
import { EnrollmentService } from './enrollment.service'
import { EnrollmentRepository } from './repository/enrollment.repository'
import { EnrollmentTable } from 'src/database/enrollment.table'

@Module({
  controllers: [EnrollmentController],
  providers: [
    EnrollmentService,
    EnrollmentRepository,
    // { provide: 'IEnrollmentRepository', useClass: EnrollmentRepository },
    EnrollmentTable,
  ],
})
export class EnrollmentModule {}
