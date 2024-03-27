import { Injectable } from '@nestjs/common'
import { randomInt } from 'crypto'
import { Enrollment } from 'src/enrollment/models/enrollment.entities'

@Injectable()
export class EnrollmentTable {
  private readonly table: Map<number, Enrollment> = new Map()
  private total: number

  getClasses(id: string): Promise<number[]> {
    const classIds: number[] = []
    return new Promise(r =>
      setTimeout(() => {
        this.table
        this.table.forEach(x => {
          if (x.studentId == id) classIds.push(x.classId)
        })
        r(classIds)
      }, randomInt(200)),
    )
  }

  enroll(enrollment: Enrollment) {
    return new Promise(r =>
      setTimeout(() => {
        this.table.set(this.total, enrollment)
        this.total += 1
        r(enrollment)
      }, randomInt(300)),
    )
  }
}
