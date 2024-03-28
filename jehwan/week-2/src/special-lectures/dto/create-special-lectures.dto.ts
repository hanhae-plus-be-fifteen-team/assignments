import { IsDateString, IsNumber, IsString } from 'class-validator'

export class CreateSpecialLecturesDto {
  @IsString()
  title: string

  @IsDateString()
  openingDate: Date

  @IsNumber()
  maximum: number
}
