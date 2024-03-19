import { Test, TestingModule } from '@nestjs/testing'
import { UserPointService } from './point.service'
import { UserPointTable } from '../database/userpoint.table'
import { PointHistoryTable } from '../database/pointhistory.table'
import { TransactionType } from './point.model'

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

  describe('usePoint', () => {
    beforeEach(async () => {
      await service.chargePoint(1, { amount: 1000 })
    })
    it('use', async () => {
      const userId = 1
      await service.usePoint(userId, { amount: 100 })
      await service.usePoint(userId, { amount: 200 })
      const userPoint = await service.usePoint(userId, { amount: 700 })
      expect(userPoint.point).toEqual(0)
    })

    it('Amount is wrong', async () => {
      const userId = 1
      await expect(async () => {
        await service.usePoint(userId, { amount: -300 })
      }).rejects.toThrowError(new Error('양의 정수만 입력 가능합니다.'))
    })

    it('Not enough point', async () => {
      const userId = 1
      await expect(async () => {
        await service.usePoint(userId, { amount: 1100 })
      }).rejects.toThrowError(new Error('포인트가 부족합니다.'))
    })
  })

  describe('getUserPointHistory', () => {
    beforeEach(async () => {
      await service.chargePoint(1, { amount: 1000 })
      await service.usePoint(1, { amount: 100 })
      await service.chargePoint(2, { amount: 200 })
      await service.usePoint(2, { amount: 70 })
      await service.chargePoint(2, { amount: 200 })
    })
    it('getUserPointHistory', async () => {
      const pointInfo1 = await service.getUserPointHistory(1)
      const pointInfo2 = await service.getUserPointHistory(2)

      expect(pointInfo1[0].type).toEqual(TransactionType.CHARGE)
      expect(pointInfo1[1].type).toEqual(TransactionType.USE)
      expect(pointInfo1[1].amount).toEqual(100)
      expect((await service.getUserPoint(1)).point).toEqual(900)

      expect(pointInfo2[0].type).toEqual(TransactionType.CHARGE)
      expect(pointInfo2[1].type).toEqual(TransactionType.USE)
      expect(pointInfo2[2].type).toEqual(TransactionType.CHARGE)
      expect((await service.getUserPoint(2)).point).toEqual(330)
    })
  })
})
