import { Injectable } from '@nestjs/common'
import { randomInt } from 'crypto'
import { Enrollment } from 'src/enrollment/enrollment.model'

@Injectable()
export class EnrollmentTable {
  private readonly table: Map<number, Enrollment> = new Map()
  private total: number

  selectById(id: string): Promise<number[]> {
    const classIds: number[] = []
    return new Promise(r =>
      setTimeout(() => {
        this.table.forEach(x => {
          if (x.studentId == id) classIds.push(x.classId)
        })
        r(classIds)
      }, randomInt(200)),
    )
  }

  insertOrUpdate(studentId: string, classId: number) {
    return new Promise(r =>
      setTimeout(() => {
        const enrollment = { studentId: studentId, classId: classId }
        this.table.set(this.total, enrollment)
        this.total += 1
        r(enrollment)
      }, randomInt(300)),
    )
  }
}
