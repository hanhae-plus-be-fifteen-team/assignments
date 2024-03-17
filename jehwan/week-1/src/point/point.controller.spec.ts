import { Test, TestingModule } from '@nestjs/testing'
import { PointController } from './point.controller'
import { PointService } from './point.service'

describe('PointController', () => {
  let pointController: PointController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PointController],
      providers: [PointService],
    }).compile()

    pointController = app.get<PointController>(PointController)
  })
})
