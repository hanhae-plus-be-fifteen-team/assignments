import { Test, TestingModule } from '@nestjs/testing'
import { PointController } from './point.controller'
import { PointService } from './point.service'

describe('PointController', () => {
  let pointController: PointController
  let pointService: PointService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PointController],
      providers: [PointService],
    }).compile()

    pointController = app.get<PointController>(PointController)
    pointService = app.get<PointService>(PointService)
  })

  beforeEach(async () => {
    // create initial data
    const userId = 1
    await pointService.charge(userId, 10000)
    await pointService.use(userId, 5000)
    await pointService.use(userId, 3000)
    await pointService.charge(userId, 50000)
  })

  it.todo(
    'Succeed to return the point balance when PointController.point() is called',
  )
  it.todo(
    'Succeed to return the point histories when PointController.history() is called',
  )
  it.todo(
    'Succeed to return the point balance after charge when PointController.charge() is called',
  )
  it.todo(
    'Succeed to return the point balance after use when PointController.use() is called',
  )
  it.todo(
    'Throw BadRequestException call PointController.use() if the balance is insufficient',
  )
})
