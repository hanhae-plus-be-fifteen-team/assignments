import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Enrollment } from '../models/enrollment.entities'
import { EnrollResult } from '../models/enrollment.result'
import { IEnrollmentRepository } from './enrollment.interface'
import { EnrollmentTable } from '../../database/enrollment.table'

@Injectable()
export class FakeRepository implements IEnrollmentRepository {
  constructor(
    @InjectRepository(EnrollmentTable)
    private readonly repository: EnrollmentTable,
  ) {}
  private _total = 0
  // fixme : class의 total값은 db에서 가져온다.

  async enroll(studentId: string, classId: number): Promise<EnrollResult> {
    if ((await this.getClasses(studentId)).includes(classId))
      return EnrollResult.AlreadyEnrolled
    if (this._total <= 30) {
      this._total += 1
      const enrollment = {
        studentId: studentId,
        classId: classId,
      } as Enrollment
      await this.repository.enroll(enrollment)
      return EnrollResult.Success
    } else {
      return EnrollResult.Closed
    }
  }

  async getClasses(studentId: string): Promise<number[]> {
    return await this.repository.getClasses(studentId)
  }
}
