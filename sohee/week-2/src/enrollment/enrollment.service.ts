import { Injectable } from '@nestjs/common'
import { EnrollResult } from './enrollment.model'
import { EnrollmentRepository } from './repository/enrollment.repository'

@Injectable()
export class EnrollmentService {
  constructor(private readonly enrollRepository: EnrollmentRepository) {}

  async enroll(studentId: string, classId: number): Promise<EnrollResult> {
    return await this.enrollRepository.enroll(studentId, classId)
  }

  async getClasses(studentId: string): Promise<number[]> {
    return await this.enrollRepository.getClasses(studentId)
  }
}
