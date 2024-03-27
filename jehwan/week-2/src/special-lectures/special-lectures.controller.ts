import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotImplementedException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common'
import { SpecialLecturesServiceAdapter } from './special-lectures.service.adapter'
import { CreateSpecialLecturesDto } from './dto/create-special-lectures.dto'

@Controller('/special-lectures')
export class SpecialLecturesController {
  /**
   *
   * @param adapter
   * @description
   * Referencing the service adapter, not the service directly.
   */
  constructor(private adapter: SpecialLecturesServiceAdapter) {}

  /**
   *
   * @param lectureId lecture's id
   * @param userId  user's id for the lecture
   * @returns user's application result
   */
  @Get(':lecture-id/applications/:user-id')
  readOneApplication(
    @Param('lecture-id', ParseIntPipe) lectureId: number,
    @Param('user-id', ParseIntPipe) userId: number,
  ) {
    return this.adapter.service.readOneApplication(lectureId, userId)
  }

  /**
   *
   * @param lectureId lecture's id
   * @returns all applications
   */
  @Get(':lecture-id/applications')
  readAllApplications(@Param('lecture-id', ParseIntPipe) lectureId: number) {
    throw new NotImplementedException()
  }

  /**
   *
   * @param lectureId lecture's id
   * @returns lecture that matches with id
   */
  @Get(':lecture-id')
  readOneLecture(@Param('lecture-id', ParseIntPipe) lectureId: number) {
    throw new NotImplementedException()
  }

  /**
   *
   * @returns all lectures
   */
  @Get()
  readAllLectures() {
    throw new NotImplementedException()
  }

  /**
   *
   * @param body CreateSpecialLecturesDto
   * @returns lecture that created
   */
  @Post()
  createLecture(@Body(new ValidationPipe()) body: CreateSpecialLecturesDto) {
    throw new NotImplementedException()
  }

  /**
   *
   * @param lectureId lecture's id
   * @param userId  user's id for the lecture
   * @returns user's application result
   * @description Make the user into an applied status.
   */
  @Patch(':lecture-id/applications/:user-id')
  async applyForLecture(
    @Param('lecture-id', ParseIntPipe) lectureId: number,
    @Param('user-id', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.adapter.service.applyForLecture(lectureId, userId)
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
