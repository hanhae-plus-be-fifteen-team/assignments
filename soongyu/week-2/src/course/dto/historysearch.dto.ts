import { IsInt } from 'class-validator'

export class CourseHistorySearchDto {
  @IsInt()
  courseId: number

  @IsInt()
  userId: number
}
