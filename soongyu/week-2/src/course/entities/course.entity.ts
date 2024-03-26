import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('Course')
export class Course {
  @PrimaryColumn({
    name: 'course_id',
  })
  courseId: number

  @Column({ name: 'course_name', type: 'varchar', length: 20 })
  courseName: string

  @Column({ name: 'opened_at', type: 'datetime' })
  openedAt: Date

  @Column({ name: 'nmb_students', type: 'int' })
  nmbStudents: number
}
