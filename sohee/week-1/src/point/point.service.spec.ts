import { Test, TestingModule } from '@nestjs/testing'
import { PointService } from './point.service'
import { TransactionType, UserPoint } from './point.model'
import { BadRequestException } from '@nestjs/common/exceptions'
import { UserPointTable } from '../database/userpoint.table'
import { PointHistoryTable } from '../database/pointhistory.table'

describe('PointService', () => {
  let service: PointService
  let mockUserDb: { selectById: jest.Mock; insertOrUpdate: jest.Mock }
  let mockHistoryDb: { insert: jest.Mock; selectAllByUserId: jest.Mock }

  beforeEach(async () => {
    mockUserDb = {
      selectById: jest.fn(),
      insertOrUpdate: jest.fn(),
    }
    mockHistoryDb = {
      insert: jest.fn(),
      selectAllByUserId: jest.fn(),
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointService,
        {
          provide: UserPointTable,
          useValue: mockUserDb,
        },
        {
          provide: PointHistoryTable,
          useValue: mockHistoryDb,
        },
      ],
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
      jest.spyOn(service, 'getOne').mockResolvedValue({
        id: userId,
        point: amount,
        updateMillis: Date.now(),
      })

      jest.spyOn(mockUserDb, 'insertOrUpdate').mockResolvedValue({
        id: userId,
        amount: amount,
      })
      await service.charge(userId, amount)
    })

    afterEach(async () => {
      jest.resetModules()
    })

    it('succeed to get', async () => {
      const result = await service.getOne(userId)
      expect(amount).toEqual(result.point)
    })

    it('fail to get', async () => {
      try {
        await service.getOne(2).then(_ => _.point)
      } catch (e) {
        expect(e).toBeInstanceOf(Error)
        expect(e.message).toEqual('올바르지 않은 ID 값 입니다.')
      }
    })
  })

  describe('getHistory', () => {
    const userId = 1
    const amount1 = 0
    const amount2 = 100
    const amount3 = 5
    const amount4 = 30

    beforeEach(async () => {
      jest.spyOn(service, 'getOne').mockImplementation(async (id: number) => {
        return {
          id: id,
          point: 0,
          updateMillis: Date.now(),
        } as UserPoint
      })
    })

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
    const amount3 = -100
    beforeEach(async () => {
      jest.spyOn(service, 'getOne').mockResolvedValue({
        id: userId,
        point: amount1,
        updateMillis: Date.now(),
      })

      mockUserDb.insertOrUpdate.mockResolvedValue(
        (id: number, amt: number) =>
          ({
            id: id,
            point: amt,
            updateMillis: Date.now(),
          }) as UserPoint,
      )

      await service.charge(userId, amount1)
    })

    it('succeed to charge', async () => {
      const p2 = await service.charge(userId, amount2)
      expect(p2.point).toBe(amount2)
    })

    it('fail to charge', async () => {
      const originPoint = await service.getOne(userId)
      try {
        // 음수 값을 충전한다.
        await service.charge(userId, amount3)
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException)
      }

      // 충전되지 않았음을 확인하기 위해 재조회한다.
      const newPoint = await service.getOne(userId)
      expect(newPoint.point).toEqual(originPoint.point)
    })
  })

  describe('use', () => {
    const userId = 1
    const amount1 = 100
    const useAmount0 = -50
    const useAmount1 = 70
    const useAmount2 = 110

    beforeEach(async () => {
      await service.charge(userId, amount1)
    })

    it('succeed to use', async () => {
      const p1 = await service.use(userId, useAmount1)
      expect(p1.point).toBe(amount1 - useAmount1)
    })

    it('fail to use - invalid request', async () => {
      const origin = await service.getOne(userId)
      try {
        await service.use(userId, useAmount0)
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException)
      }
      const updated = await service.getOne(userId)
      expect(updated.point).toEqual((await origin).point)
    })

    it('fail to use - lack of points', async () => {
      const p2 = await service.use(userId, useAmount2)
      expect(p2.point).toBe(amount1)
    })
  })
})
