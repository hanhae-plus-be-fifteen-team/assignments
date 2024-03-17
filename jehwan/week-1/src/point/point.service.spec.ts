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
        expect(pointAfterCharge).toBe(accumulates[parseInt(i) + 1])
      }
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
      expect(pointAfterUse).toBe(rest)
    })
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
