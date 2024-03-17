import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

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
      const requests = await Promise.all(
        Array.from({ length: 10 }, (_, i) => {
          return request(app.getHttpServer()).patch('/point/1/charge').send({
            amount: 10000,
          })
        }),
      )

      // If sorted by amount, the largest result should be 10000.
      // The order of calling is not important.
      requests.sort((a, b) => a.body.point - b.body.point)
      expect(requests.map(r => r.body.point).at(-1)).toBe(100000)
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
      const requests = await Promise.all(
        Array.from({ length: 3 }, (_, i) => {
          return request(app.getHttpServer()).patch('/point/1/use').send({
            amount: 500,
          })
        }),
      )

      // If sorted by amount, the smallest result should be 8500.
      // The order of calling is not important.
      requests.sort((a, b) => a.body.point - b.body.point)
      expect(requests.map(r => r.body.point).at(0)).toBe(8500)
    })
    it('Return BadRequest when if the balance is insufficient', async () => {
      request(app.getHttpServer())
        .patch('/point/1/use')
        .send({
          amount: 99999,
        })
        .expect(400)
    })
  })
  describe('GET /point/{id}', () => {
    it.todo('Return a user point matching the given {id}.')
  })
  describe('GET /point/{id}/histories', () => {
    it.todo('Return user histories matching the given {id}.')
  })
})
