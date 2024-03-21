import { IsInt, Min } from 'class-validator'

export class PointBody {
  @Min(0)
  @IsInt()
  amount: number
}
