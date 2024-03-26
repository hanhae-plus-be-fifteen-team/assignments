import { CourseRegistrationDto } from './dto/registration.dto'
import { CourseRegHistory } from './entities/course.reg.history.entity'
import { CourseRepositoryImpl } from './course.repository'
import { CourseHistorySearchDto } from './dto/historysearch.dto'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CourseService {
  constructor(private readonly courseRepository: CourseRepositoryImpl) {}
  async register(courseRegistrationDto: CourseRegistrationDto): Promise<void> {}

  async find(
    courseHistorySearchDto: CourseHistorySearchDto,
  ): Promise<CourseRegHistory[]> {
    return await this.courseRepository.find(courseHistorySearchDto)
  }
}
