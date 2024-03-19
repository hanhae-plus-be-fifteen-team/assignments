import { Test, TestingModule } from '@nestjs/testing'
import { UserPointService } from './userpoint.service'

describe('UserPointService', () => {
  let service: UserPointService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPointService],
    }).compile()

    service = module.get<UserPointService>(UserPointService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
