import { CourseRepositoryImpl } from './course.repository'
import { CourseService } from './course.service'
import { Test } from '@nestjs/testing'
import { CourseHistorySearchDto } from './dto/historysearch.dto'
import { CourseRegHistory } from './entities/course.reg.history.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

describe('CourseService', () => {
  let service: CourseService
  let repository: CourseRepositoryImpl

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CourseService,
        CourseRepositoryImpl,
        // @InjectRepository(CourseRegHistory)에 대한 설정
        {
          provide: getRepositoryToken(CourseRegHistory),
          useClass: Repository<CourseRegHistory>,
        },
      ],
    }).compile()

    service = module.get<CourseService>(CourseService)
    repository = module.get<CourseRepositoryImpl>(CourseRepositoryImpl)
  })

  describe('수강신청 결과 조회', () => {
    it('수강신청 성공', async () => {
      const requestDto = new CourseHistorySearchDto()
      requestDto.courseId = 1
      requestDto.userId = 1

      jest
        .spyOn(repository, 'find')
        .mockResolvedValue([
          { courseId: 1, userId: 1, createdAt: new Date('2024-03-27') },
        ])

      expect(await service.find(requestDto)).toMatchObject([
        { courseId: 1, userId: 1, createdAt: new Date('2024-03-27') },
      ])
    })

    it('수강신청 실패', async () => {
      const requestDto = new CourseHistorySearchDto()
      requestDto.courseId = 1
      requestDto.userId = 1

      jest.spyOn(repository, 'find').mockResolvedValue([])

      expect(await service.find(requestDto)).toMatchObject([])
    })
  })
})
