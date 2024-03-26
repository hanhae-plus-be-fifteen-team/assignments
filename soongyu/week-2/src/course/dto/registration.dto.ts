import { IsInt } from 'class-validator'

export class CourseRegistrationDto {
  @IsInt()
  courseId: number

  @IsInt()
  userId: number
}
