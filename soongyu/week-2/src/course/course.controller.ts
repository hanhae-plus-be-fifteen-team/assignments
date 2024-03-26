import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { CourseService } from './course.service'
import { CourseRegistrationDto } from './dto/registration.dto'
import { CourseHistorySearchDto } from './dto/historysearch.dto'

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('register')
  async register(
    @Body() CourseRegistrationDto: CourseRegistrationDto,
  ): Promise<void> {}

  @Get('history/:courseId/:userId')
  async history(
    @Param('courseId') courseId: number,
    @Param('userId') userId: number,
  ): Promise<boolean> {
    const courseHistorySearchDto = new CourseHistorySearchDto()
    courseHistorySearchDto.courseId = courseId
    courseHistorySearchDto.userId = userId
    return (await this.courseService.find(courseHistorySearchDto)).length > 0
  }
}
