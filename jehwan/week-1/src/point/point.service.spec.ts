import { Test, TestingModule } from '@nestjs/testing'
import { PointService } from './point.service'
import { UserPointTable } from '../database/userpoint.table'
import { TransactionType } from './point.model'
import { PointHistoryTable } from '../database/pointhistory.table'
import { PointHistoryRepository, UserPointRepository } from './point.repository'
import { FootprintTable } from '../database/footprint.table'

describe('PointService', () => {
  let pointService: PointService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        PointService,
        {
          provide: PointHistoryRepository,
          useClass: PointHistoryTable,
        },
        {
          provide: UserPointRepository,
          useClass: UserPointTable,
        },
        FootprintTable,
      ],
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

      expect(pointAfterCharge.point).toBe(want)
    })
    it('Succeed to charge points', async () => {
      const userId = 1
      const amounts = Array.from({ length: 10 }, (_, index) =>
        Math.floor(Math.random() * 10000),
      )
      const accumulates = amounts.reduce<number[]>(
        (acc, val) => [...acc, acc.at(-1) + val],
        [0],
      )

      for (const [i, amount] of Object.entries(amounts)) {
        const pointAfterCharge = await pointService.charge(userId, amount)
        expect(pointAfterCharge.point).toBe(accumulates[parseInt(i) + 1])
      }
    })
    it('Fail to charge if the point value is negative', async () => {
      const userId = 1
      const amount = -1 * Math.floor(1000 * Math.random())
      await expect(pointService.charge(userId, amount)).rejects.toThrow(Error)
    })
  })

  describe('PointService.use()', () => {
    beforeEach(async () => {
      // charge 10000 before do each case
      const userId = 1
      await pointService.charge(userId, 10000)
    })

    it('Succeed to use a point', async () => {
      const userId = 1
      const amount = Math.floor(Math.random() * 10000)
      const rest = 10000 - amount

      const pointAfterUse = await pointService.use(userId, amount)
      expect(pointAfterUse.point).toBe(rest)
    })
    it('Succeed to use points', async () => {
      const userId = 1
      const amounts = Array.from({ length: 10 }, (_, index) =>
        Math.floor(Math.random() * 1000),
      )
      const accumulates = amounts.reduce<number[]>(
        (acc, val) => [...acc, acc.at(-1) - val],
        [10000],
      )

      for (const [i, amount] of Object.entries(amounts)) {
        const pointAfterCharge = await pointService.use(userId, amount)
        expect(pointAfterCharge.point).toBe(accumulates[parseInt(i) + 1])
      }
    })
    it('Fail to use a point if the balance is insufficient', async () => {
      const userId = 1
      const amount = 20000

      await expect(pointService.use(userId, amount)).rejects.toThrow(Error)
    })
  })

  describe('PointService.readPoint()', () => {
    beforeEach(async () => {
      // charge 10000 before do each case
      const userId = 1
      await pointService.charge(userId, 10000)
    })

    it("Succeed to read a user's point", async () => {
      const userId = 1

      const userPoint = await pointService.readPoint(userId)
      const afterRequest = new Date().getTime()

      expect(userPoint.id).toBe(userId)
      expect(userPoint.point).toBe(10000)
      expect(userPoint.updateMillis).toBeLessThanOrEqual(afterRequest)
    })
  })

  describe('PointService.readHistories()', () => {
    beforeEach(async () => {
      // charge points 2 times and use points 2 times
      const userId = 1
      await pointService.charge(userId, 10000)
      await pointService.charge(userId, 25000)
      await pointService.use(userId, 5000)
      await pointService.use(userId, 8000)
    })

    it("Succeed to read user's histories", async () => {
      const userId = 1

      const histories = await pointService.readHistories(userId)

      expect(histories[0].type).toBe(TransactionType.CHARGE)
      expect(histories[1].type).toBe(TransactionType.CHARGE)
      expect(histories[2].type).toBe(TransactionType.USE)
      expect(histories[3].type).toBe(TransactionType.USE)
    })
  })
})
