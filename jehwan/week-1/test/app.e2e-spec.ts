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
    it.todo('Charge a user point matching the given {id}.')
    it.todo('Charge user points concurrently for the given {id}.')
  })
  describe('PATCH /point/{id}/use', () => {
    it.todo('Use a user point matching the given {id}.')
    it.todo('Use user points concurrently for the given {id}.')
    it.todo('Return BadRequest when if the balance is insufficient')
  })
  describe('GET /point/{id}', () => {
    it.todo('Return a user point matching the given {id}.')
  })
  describe('GET /point/{id}/histories', () => {
    it.todo('Return user histories matching the given {id}.')
  })
})
