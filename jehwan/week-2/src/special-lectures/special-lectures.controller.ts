import { Controller, Get, Param, Patch } from '@nestjs/common'
import { SpecialLecturesServiceAdapter } from './special-lectures.service.adapter'

@Controller('/special-lectures')
export class SpecialLecturesController {
  constructor(private adapter: SpecialLecturesServiceAdapter) {}

  @Get(':id/application')
  read(@Param('id') id: string) {
    const applicantId = Number.parseInt(id)
    return this.adapter.service.read(applicantId)
  }

  @Patch(':id/application')
  apply(@Param('id') id: string) {
    const applicantId = Number.parseInt(id)
    return this.adapter.service.apply(applicantId)
  }
}
