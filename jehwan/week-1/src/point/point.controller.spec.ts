import { Test, TestingModule } from '@nestjs/testing'
import { PointController } from './point.controller'
import { PointService } from './point.service'
import { PointHistoryTable } from '../database/pointhistory.table'
import { UserPointTable } from '../database/userpoint.table'
import { TransactionType } from './point.model'

describe('PointController', () => {
  let pointController: PointController
  let pointService: PointService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PointController],
      providers: [
        PointService,
        /**
         * todo consider implementing mocks for in future development
         */
        PointHistoryTable,
        UserPointTable,
      ],
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

  it('Succeed to return the point balance when PointController.point() is called', async () => {
    const userId = '1'
    const userPoint = await pointController.point(userId)

    expect(userPoint.point).toBe(52000)
  })
  it('Succeed to return the point histories when PointController.history() is called', async () => {
    const userId = '1'
    const histories = await pointController.history(userId)
    const want = [
      TransactionType.CHARGE,
      TransactionType.USE,
      TransactionType.USE,
      TransactionType.CHARGE,
    ]

    expect(histories.map(history => history.type)).toEqual(want)
  })
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
