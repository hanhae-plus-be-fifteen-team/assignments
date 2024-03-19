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

    it('succeed to get', async () => {
      await service.charge(userId, amount)
      const result = await service.getOne(userId).then(_ => _.point)
      expect(amount).toEqual(result)
    })

    it('fail to get', async () => {
      await service.charge(userId, amount)
      try {
        await service.getOne(2).then(_ => _.point)
      } catch (e) {
        expect(e).toBe('올바르지 않은 ID 값 입니다.')
      }
    })
  })
})
