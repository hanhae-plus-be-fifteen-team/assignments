import { IsDate, IsString } from 'class-validator'

export class CreateSpecialLecturesDto {
  @IsString()
  title: string

  @IsDate()
  openingDate: Date
}
