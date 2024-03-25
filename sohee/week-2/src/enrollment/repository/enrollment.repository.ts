import { Injectable } from '@nestjs/common'
import { IEnrollmentRepository } from './enrollment.interface'
import { EnrollmentTable } from 'src/database/enrollment.table'
import { EnrollResult } from '../enrollment.model'

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(private readonly enrollmentDb: EnrollmentTable) {}
  private _total = 0
  // fixme : class의 total값은 db에서 가져온다.

  async enroll(studentId: string, classId: number): Promise<EnrollResult> {
    if ((await this.getClasses(studentId)).includes(classId))
      return EnrollResult.AlreadyEnrolled
    if (this._total <= 30) {
      this._total += 1
      await this.enrollmentDb.insertOrUpdate(studentId, classId)
      return EnrollResult.Success
    } else {
      return EnrollResult.Closed
    }
  }

  async getClasses(studentId: string): Promise<number[]> {
    return await this.enrollmentDb.selectById(studentId)
  }
}
