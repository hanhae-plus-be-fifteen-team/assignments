import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
} from '@nestjs/common'
import { SpecialLecturesServiceAdapter } from './special-lectures.service.adapter'

@Controller('/special-lectures')
export class SpecialLecturesController {
  /**
   *
   * @param adapter
   * @description
   * Referencing the service adapter, not the service directly.
   */
  constructor(private adapter: SpecialLecturesServiceAdapter) {}

  @Get(':id/application')
  read(@Param('id') id: string) {
    const applicantId = Number.parseInt(id)
    return this.adapter.service.read(applicantId)
  }

  @Patch(':id/application')
  async apply(@Param('id') id: string) {
    const applicantId = Number.parseInt(id)
    try {
      return await this.adapter.service.apply(applicantId)
    } catch (e) {
      switch (e.message) {
        case 'Limit Exceeded':
          throw new BadRequestException('Limit Exceeded (maximum 30)')
        case 'Already Applied':
          throw new BadRequestException('Already Applied')
        default: // fallback
          console.log(e)
          throw new InternalServerErrorException('Internal Server Exception', {
            cause: e,
          })
      }
    }
  }
}
