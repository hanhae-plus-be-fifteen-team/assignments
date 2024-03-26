import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

@Entity('COURSE_REG_HISTORY')
export class CourseRegHistory {
  @PrimaryColumn({
    name: 'course_id',
  })
  courseId: number

  @PrimaryColumn({
    name: 'user_id',
  })
  userId: number

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP()',
  })
  createdAt: Date
}
