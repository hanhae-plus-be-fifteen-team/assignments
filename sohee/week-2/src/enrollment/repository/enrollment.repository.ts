import { Injectable } from '@nestjs/common'
import { EnrollResult } from '../models/enrollment.result'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Enrollment } from '../models/enrollment.entities'
import { IEnrollmentRepository } from './enrollment.interface'

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(
    @InjectRepository(Enrollment)
    private readonly repository: Repository<Enrollment>,
  ) {}
  private _total = 0
  // fixme : class의 total값은 db에서 가져온다.

  async enroll(studentId: string, classId: number): Promise<EnrollResult> {
    if ((await this.getClasses(studentId)).includes(classId))
      return EnrollResult.AlreadyEnrolled
    if (this._total <= 30) {
      this._total += 1
      const enrollment = { studentId: studentId, classId: classId }
      await this.repository.save(enrollment)
      return EnrollResult.Success
    } else {
      return EnrollResult.Closed
    }
  }

  async getClasses(studentId: string): Promise<number[]> {
    const enrollments = await this.repository.find({
      where: { studentId: studentId },
    })
    return enrollments.map(e => e.classId)
  }
}
