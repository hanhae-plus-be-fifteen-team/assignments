import { BadRequestException, Injectable } from '@nestjs/common'
import { EnrollResult } from '../models/enrollment.result'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Class, Enrollment } from '../models/enrollment.entities'
import { IEnrollmentRepository } from './enrollment.interface'

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollHistory: Repository<Enrollment>,
    @InjectRepository(Class)
    private readonly classes: Repository<Class>,
  ) {}

  async enroll(studentId: string, classId: number): Promise<EnrollResult> {
    return await this.classes
      .findOne({
        where: { id: classId },
      })
      .then(async c => {
        if (c.students.includes(studentId)) return EnrollResult.AlreadyEnrolled
        if (c.total - c.students.length > 0) {
          c.students.push(studentId)
          const enrollment = { studentId: studentId, classId: classId }
          await this.enrollHistory.save(enrollment)
          return EnrollResult.Success
        } else {
          return EnrollResult.Closed
        }
      })
      .catch(e => {
        console.log(e)
        throw BadRequestException
      })
  }

  async getClasses(studentId: string): Promise<number[]> {
    const enrollments = await this.enrollHistory.find({
      where: { studentId: studentId },
    })
    return enrollments.map(e => e.classId)
  }
}
