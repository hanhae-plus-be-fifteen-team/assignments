import { IsDate, IsNumber, IsString } from 'class-validator'

export class CreateSpecialLecturesDto {
  @IsString()
  title: string

  @IsDate()
  openingDate: Date

  @IsNumber()
  maximum: number
}
