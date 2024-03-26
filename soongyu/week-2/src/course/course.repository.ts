import { InjectRepository } from '@nestjs/typeorm'
import { CourseRegistrationDto } from './dto/registration.dto'
import { CourseRegHistory } from './entities/course.reg.history.entity'
import { Repository } from 'typeorm'
import { CourseHistorySearchDto } from './dto/historysearch.dto'

interface CourseRepository {
  register(courseRegistrationDto: CourseRegistrationDto): Promise<void>
  find(
    courseHistorySearchDto: CourseHistorySearchDto,
  ): Promise<CourseRegHistory[]>
}

export class CourseRepositoryImpl implements CourseRepository {
  constructor(
    @InjectRepository(CourseRegHistory)
    private readonly courseRepository: Repository<CourseRegHistory>,
  ) {}

  async register(courseRegistrationDto: CourseRegistrationDto): Promise<void> {}

  async find(
    courseHistorySearchDto: CourseHistorySearchDto,
  ): Promise<CourseRegHistory[]> {
    const courseHisInfo = new CourseRegHistory()
    courseHisInfo.courseId = courseHistorySearchDto.courseId
    courseHisInfo.userId = courseHistorySearchDto.userId
    return await this.courseRepository.find({
      where: [
        { courseId: courseHisInfo.courseId, userId: courseHisInfo.userId },
      ],
    })
  }
}
