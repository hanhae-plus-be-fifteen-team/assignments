import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { TransactionType } from '../src/point/point.model'
import supertest from 'supertest'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  describe('PATCH /point/{id}/charge', () => {
    it('Charge a user point matching the given {id}.', async () => {
      const beforeCharge = new Date().getTime()

      await request(app.getHttpServer())
        .patch('/point/1/charge')
        .send({
          amount: 10000,
        })
        .expect(200)
        .expect(res => {
          if (res.body.id !== 1) {
            throw new Error('The id does not match')
          }
          if (res.body.point !== 10000) {
            throw new Error('The point does not match')
          }
          if (res.body.updateMillis < beforeCharge) {
            throw new Error('The updateMillis is incorrect')
          }
        })
    })
    it('Charge user points concurrently for the given {id}.', async () => {
      const responses = await Promise.allSettled(
        Array.from({ length: 10 }, (_, i) => {
          return request(app.getHttpServer()).patch('/point/1/charge').send({
            amount: 10000,
          })
        }),
      )

      // to assert fulfilled promise
      expect(isAllFulfilled(responses)).toBeTruthy()
      const fulfilled = asAllFulfilled(responses)

      // If sorted by amount, the largest result should be 100000.
      // The order of calling is not important.
      expect(getMaxPoint(fulfilled)).toBe(100000)
    })
    it('Charge the negative point', async () => {
      await request(app.getHttpServer())
        .patch('/point/1/charge')
        .send({
          amount: -1000,
        })
        .expect(400)
    })
  })
  describe('PATCH /point/{id}/use', () => {
    beforeEach(async () => {
      // charge before test
      await request(app.getHttpServer()).patch('/point/1/charge').send({
        amount: 10000,
      })
    })

    it('Use a user point matching the given {id}.', async () => {
      const beforeCharge = new Date().getTime()

      await request(app.getHttpServer())
        .patch('/point/1/use')
        .send({
          amount: 1000,
        })
        .expect(200)
        .expect(res => {
          if (res.body.id !== 1) {
            throw new Error('The id does not match')
          }
          if (res.body.point !== 9000) {
            throw new Error('The point does not match')
          }
          if (res.body.updateMillis < beforeCharge) {
            throw new Error('The updateMillis is incorrect')
          }
        })
    })
    it('Use user points concurrently for the given {id}.', async () => {
      const responses = await Promise.allSettled(
        Array.from({ length: 3 }, (_, i) => {
          return request(app.getHttpServer()).patch('/point/1/use').send({
            amount: 500,
          })
        }),
      )

      // to assert fulfilled promise
      expect(isAllFulfilled(responses)).toBeTruthy()
      const fulfilled = asAllFulfilled(responses)

      // If sorted by amount, the smallest result should be 8500.
      // The order of calling is not important.
      expect(getMinPoint(fulfilled)).toBe(8500)
    })
    it('Return BadRequest when if the balance is insufficient', async () => {
      request(app.getHttpServer())
        .patch('/point/1/use')
        .send({
          amount: 99999,
        })
        .expect(400)
        .end(() => {})
    })
  })
  describe('GET /point/{id}', () => {
    beforeEach(async () => {
      // charge before test
      await request(app.getHttpServer()).patch('/point/1/charge').send({
        amount: 10000,
      })
      await request(app.getHttpServer()).patch('/point/1/use').send({
        amount: 1000,
      })
    })

    it('Return a user point matching the given {id}.', async () => {
      await request(app.getHttpServer())
        .get('/point/1')
        .expect(200)
        .expect(res => {
          if (res.body.id !== 1) {
            throw new Error('The id does not match')
          }
          if (res.body.point !== 9000) {
            throw new Error('The point does not match')
          }
          if (typeof res.body.updateMillis !== 'number') {
            throw new Error('The updateMillis is incorrect')
          }
        })
    })
  })
  describe('GET /point/{id}/histories', () => {
    beforeEach(async () => {
      // charge before test
      await request(app.getHttpServer()).patch('/point/1/charge').send({
        amount: 10000,
      })
      await request(app.getHttpServer()).patch('/point/1/use').send({
        amount: 1000,
      })
    })

    it('Return user histories matching the given {id}.', async () => {
      await request(app.getHttpServer())
        .get('/point/1/histories')
        .expect(200)
        .expect(res => {
          const [h1, h2] = res.body

          if (h1.type !== TransactionType.CHARGE) {
            throw new Error('The first history is incorrect')
          }
          if (h2.type !== TransactionType.USE) {
            throw new Error('The second history is incorrect')
          }
        })
    })
  })
})

function isAllFulfilled(
  requests: PromiseSettledResult<supertest.Response>[],
): requests is PromiseFulfilledResult<supertest.Response>[] {
  return !requests.some(r => r.status === 'rejected')
}

function asAllFulfilled(
  requests: PromiseSettledResult<supertest.Response>[],
): PromiseFulfilledResult<supertest.Response>[] {
  return requests as PromiseFulfilledResult<supertest.Response>[]
}

function getMaxPoint(fulfilled: PromiseFulfilledResult<supertest.Response>[]) {
  return Math.max(...fulfilled.map(r => r.value.body.point))
}

function getMinPoint(fulfilled: PromiseFulfilledResult<supertest.Response>[]) {
  return Math.min(...fulfilled.map(r => r.value.body.point))
}
