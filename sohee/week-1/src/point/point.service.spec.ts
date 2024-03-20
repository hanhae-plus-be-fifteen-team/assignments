import { Test, TestingModule } from '@nestjs/testing'
import { PointService } from './point.service'
import { UserPointTable } from '../database/userpoint.table'
import { PointHistoryTable } from '../database/pointhistory.table'
import { TransactionType } from './point.model'

describe('PointService', () => {
  let service: PointService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointService, UserPointTable, PointHistoryTable],
    }).compile()

    service = module.get<PointService>(PointService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('get', () => {
    const userId = 1
    const amount = 0
    beforeEach(async () => {
      await service.charge(userId, amount)
    })

    it('succeed to get', async () => {
      const result = await service.getOne(userId).then(_ => _.point)
      expect(amount).toEqual(result)
    })

    it('fail to get', async () => {
      try {
        await service.getOne(2).then(_ => _.point)
      } catch (e) {
        expect(e).toBe('올바르지 않은 ID 값 입니다.')
      }
    })
  })
  describe('getHistory', () => {
    const userId = 1
    const amount1 = 0
    const amount2 = 100
    const amount3 = 5 // use
    const amount4 = 30

    it('get all history', async () => {
      await service.charge(userId, amount1)
      await service.charge(userId, amount2)
      await service.use(userId, amount3)
      await service.charge(userId, amount4)

      const history = await service.getHistory(userId)
      expect(history[0].type).toBe(TransactionType.CHARGE)
      expect(history[1].type).toBe(TransactionType.CHARGE)
      expect(history[2].type).toBe(TransactionType.USE)
      expect(history[3].type).toBe(TransactionType.CHARGE)
    })
  })

  describe('charge', () => {
    const userId = 1
    const amount1 = 0
    const amount2 = 100
    beforeEach(async () => {
      await service.charge(userId, amount1)
    })

    it('succeed to charge', async () => {
      const p2 = await service.charge(userId, amount2)
      expect(p2.point).toBe(amount2)
    })
  })

  describe('use', () => {
    const userId = 1
    const amount1 = 100
    const useAmount1 = 70
    const useAmount2 = 110
    beforeEach(async () => {
      await service.charge(userId, amount1)
    })

    it('succeed to use', async () => {
      const p1 = await service.use(userId, useAmount1)
      expect(p1.point).toBe(amount1 - useAmount1)
    })

    it('fail to use', async () => {
      const p2 = await service.use(userId, useAmount2)
      expect(p2.point).toBe(amount1)
    })
  })
})
