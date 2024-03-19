import { Test, TestingModule } from '@nestjs/testing'
import { UserPointService } from './point.service'
import { UserPointTable } from '../database/userpoint.table'
import { PointHistoryTable } from '../database/pointhistory.table'

describe('UserPointService', () => {
  let service: UserPointService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPointService, UserPointTable, PointHistoryTable],
    }).compile()

    service = module.get<UserPointService>(UserPointService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getUserPoint', () => {
    it('getUserPoint', async () => {
      const userId = 1
      const userPoint = await service.getUserPoint(userId)
      expect(userPoint.id).toEqual(1)
      expect(userPoint.point).toEqual(0)
      expect(userPoint.updateMillis).toBeLessThan(Date.now())
    })
  })

  describe('chargePoint', () => {
    it('charge', async () => {
      const userId = 1
      await service.chargePoint(userId, { amount: 100 })
      await service.chargePoint(userId, { amount: 200 })
      const userPoint = await service.chargePoint(userId, { amount: 300 })
      expect(userPoint.point).toEqual(600)
    })

    it('Amount is wrong', async () => {
      const userId = 1
      await expect(async () => {
        await service.chargePoint(userId, { amount: -300 })
      }).rejects.toThrowError(new Error('양의 정수만 입력 가능합니다.'))
    })
  })
})
