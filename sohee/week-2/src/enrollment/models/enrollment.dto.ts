import { IsArray, IsInt, IsString } from 'class-validator'

export class ClassDto {
  @IsInt()
  id: number

  @IsInt()
  total: number

  @IsArray()
  students: string[]
}

export class EnrollmentDto {
  @IsInt()
  id: number

  @IsInt()
  classId: number

  @IsString()
  studentId: string
}
