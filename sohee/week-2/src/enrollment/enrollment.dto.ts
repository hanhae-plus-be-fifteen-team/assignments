import { IsInt } from 'class-validator'

export class EnrollBody {
  @IsInt()
  id: number
}
