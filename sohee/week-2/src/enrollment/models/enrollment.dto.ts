import { IsInt, IsString } from 'class-validator'

export class ClassDto {
  @IsInt()
  id: number
}

export class EnrollmentDto {
  @IsInt()
  id: number

  @IsInt()
  classId: number

  @IsString()
  studentId: string
}
