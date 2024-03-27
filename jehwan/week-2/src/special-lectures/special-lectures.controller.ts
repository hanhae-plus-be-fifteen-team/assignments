import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
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

  @Get(':lecture-id/applications/:user-id')
  readApplication(
    @Param('lecture-id', ParseIntPipe) lectureId: number,
    @Param('user-id', ParseIntPipe) userId: number,
  ) {
    return this.adapter.service.read(lectureId, userId)
  }

  @Patch(':lecture-id/applications/:user-id')
  async applyForLecture(
    @Param('lecture-id', ParseIntPipe) lectureId: number,
    @Param('user-id', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.adapter.service.apply(lectureId, userId)
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
