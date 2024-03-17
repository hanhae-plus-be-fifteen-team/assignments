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
