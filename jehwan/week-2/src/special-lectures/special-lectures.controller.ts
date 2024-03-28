import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common'
import { SpecialLecturesServiceAdapter } from './special-lectures.service.adapter'
import { CreateSpecialLecturesDto } from './dto/create-special-lectures.dto'
import { SpecialLectureException } from './models/special-lecture.excpetion.model'

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
      if (e instanceof SpecialLectureException) {
        throw this.handleSpecialLectureException(e)
      }

      throw new InternalServerErrorException('Internal Server Exception', {
        cause: e,
      })
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
      if (e instanceof SpecialLectureException) {
        throw this.handleSpecialLectureException(e)
      }

      throw new InternalServerErrorException('Internal Server Exception', {
        cause: e,
      })
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
      if (e instanceof SpecialLectureException) {
        throw this.handleSpecialLectureException(e)
      }

      // unknown error
      console.error(e)

      throw new InternalServerErrorException('Internal Server Exception', {
        cause: e,
      })
    }
  }

  private handleSpecialLectureException(e: SpecialLectureException) {
    return new BadRequestException(e.message)
  }
}
