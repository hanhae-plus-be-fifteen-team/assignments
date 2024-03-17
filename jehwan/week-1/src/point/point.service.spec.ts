import { Test, TestingModule } from '@nestjs/testing'
import { PointService } from './point.service'
import { UserPointTable } from '../database/userpoint.table'

describe('PointService', () => {
  let pointService: PointService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [PointService, UserPointTable],
    }).compile()

    pointService = app.get<PointService>(PointService)
  })

  describe('PointService.charge()', () => {
    it('Succeed to charge a point', async () => {
      const userId = 1
      const amount = 1000
      const want = 1000
      // Assume the initial balance is 0.
      const pointAfterCharge = await pointService.charge(userId, amount)

      expect(pointAfterCharge).toBe(want)
    })
    it.todo('Succeed to charge points')
  })

  describe('PointService.use()', () => {
    it.todo('Succeed to use a point')
    it.todo('Succeed to use points')
    it.todo('Fail to use a point if the balance is insufficient')
  })

  describe('PointService.readPoint()', () => {
    it.todo("Succeed to read a user's point")
  })

  describe('PointService.readHistories()', () => {
    it.todo("Succeed to read user's histories")
  })
})
