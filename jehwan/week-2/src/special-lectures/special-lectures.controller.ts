import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
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
  @Get(':lecture_id/applications/:user_id')
  async readOneApplication(
    @Param('lecture_id') lectureId: string,
    @Param('user_id') userId: string,
  ) {
    try {
      return await this.adapter.service.readOneApplication(lectureId, userId)
    } catch (e) {
      switch (e.message) {
        case 'Lecture Does Not Exist':
          throw new BadRequestException('Lecture Does not Exist')
        default: // fallback
          throw new InternalServerErrorException('Internal Server Exception', {
            cause: e,
          })
      }
    }
  }

  /**
   *
   * @param lectureId lecture's id
   * @returns all applications
   */
  @Get(':lecture_id/applications')
  async readAllApplications(@Param('lecture_id') lectureId: string) {
    try {
      return await this.adapter.service.readAllApplications(lectureId)
    } catch (e) {
      switch (e.message) {
        case 'Lecture Does Not Exist':
          throw new BadRequestException('Lecture Does not Exist')
        default: // fallback
          throw new InternalServerErrorException('Internal Server Exception', {
            cause: e,
          })
      }
    }
  }

  /**
   *
   * @returns all lectures
   */
  @Get()
  readAllLectures() {
    return this.adapter.service.readAllLectures()
  }

  /**
   *
   * @param body CreateSpecialLecturesDto
   * @returns lecture that created
   */
  @Post()
  createLecture(@Body(new ValidationPipe()) body: CreateSpecialLecturesDto) {
    return this.adapter.service.createLecture(body)
  }

  /**
   *
   * @param lectureId lecture's id
   * @param userId  user's id for the lecture
   * @returns user's application result
   * @description Make the user into an applied status.
   */
  @Patch(':lecture_id/applications/:user_id')
  async applyForLecture(
    @Param('lecture_id') lectureId: string,
    @Param('user_id') userId: string,
  ) {
    try {
      return await this.adapter.service.applyForLecture(lectureId, userId)
    } catch (e) {
      switch (e.message) {
        case 'Limit Exceeded':
          throw new BadRequestException('Limit Exceeded (maximum 30)')
        case 'Already Applied':
          throw new BadRequestException('Already Applied')
        case 'Lecture Does Not Exist':
          throw new BadRequestException('Lecture Does not Exist')
        case 'Not Started Yet':
          throw new BadRequestException('Not Started Yet')
        default: // fallback
          throw new InternalServerErrorException('Internal Server Exception', {
            cause: e,
          })
      }
    }
  }
}
