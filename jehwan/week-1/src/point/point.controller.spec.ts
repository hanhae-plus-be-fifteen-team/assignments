import { Test, TestingModule } from '@nestjs/testing'
import { PointController } from './point.controller'
import { PointService } from './point.service'
import { BadRequestException } from '@nestjs/common'

describe('PointController', () => {
  let pointController: PointController
  let pointService: PointService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PointController],
      providers: [
        {
          provide: PointService,
          useValue: {
            charge: jest.fn(),
            use: jest.fn(),
            readPoint: jest.fn(),
            readHistories: jest.fn(),
            writeLockTable: jest.fn(),
          },
        },
      ],
    }).compile()

    pointController = app.get<PointController>(PointController)
    pointService = app.get<PointService>(PointService)
  })

  it('pointController.point() successfully passes 1 to PointService.readPoint()', async () => {
    const userId = '1'
    await pointController.point(userId)

    expect(pointService.readPoint).toHaveBeenCalledTimes(1)
    expect(pointService.readPoint).toHaveBeenCalledWith(parseInt(userId))
  })
  it('pointController.history() successfully passes 1 to PointService.readHistories()', async () => {
    const userId = '1'
    await pointController.history(userId)

    expect(pointService.readHistories).toHaveBeenCalledTimes(1)
    expect(pointService.readHistories).toHaveBeenCalledWith(parseInt(userId))
  })
  it('Succeed to return the point balance after charge when PointController.charge() is called', async () => {
    const userId = '1'
    const amount = 50000
    await pointController.charge(userId, { amount })

    expect(pointService.charge).toHaveBeenCalledTimes(1)
    expect(pointService.charge).toHaveBeenCalledWith(parseInt(userId), amount)
  })
  it('Succeed to return the point balance after use when PointController.use() is called', async () => {
    const userId = '1'
    const amount = 30000
    await pointController.use(userId, { amount })

    expect(pointService.use).toHaveBeenCalledTimes(1)
    expect(pointService.use).toHaveBeenCalledWith(parseInt(userId), amount)
  })
  it('Throw BadRequestException call PointController.use() if the balance is insufficient', async () => {
    const userId = '1'
    // No matter what the amount is, it is assumed that the amount is insufficient.
    const amount = Math.round(Math.random() * 1000)

    // PointService.use() ensures that a Limit Exceeded error occurs.
    pointService.use = jest.fn().mockImplementation(() => {
      throw new Error('Limit Exceeded')
    })

    // PointController.use() should convert Limit Exceeded errors to BadRequestError.
    await expect(pointController.use(userId, { amount })).rejects.toThrow(
      BadRequestException,
    )
  })
})
