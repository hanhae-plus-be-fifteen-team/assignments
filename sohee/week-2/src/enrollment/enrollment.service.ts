import { Inject, Injectable } from '@nestjs/common'
import { EnrollResult } from './models/enrollment.result'
import {
  IENROLLMENT_REPOSITORY,
  IEnrollmentRepository,
} from './repository/enrollment.interface'

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(IENROLLMENT_REPOSITORY)
    private readonly enrollRepository: IEnrollmentRepository,
  ) {}

  async enroll(studentId: string, classId: number): Promise<EnrollResult> {
    return await this.enrollRepository.enroll(studentId, classId)
  }

  async getClasses(studentId: string): Promise<number[]> {
    return await this.enrollRepository.getClasses(studentId)
  }
}
