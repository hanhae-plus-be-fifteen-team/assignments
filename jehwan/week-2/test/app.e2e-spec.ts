import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { Pool } from 'pg'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let container: StartedTestContainer | null = null

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  beforeEach(async () => {
    container = await new GenericContainer('postgres:latest')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'password',
        POSTGRES_DB: 'test',
      })
      .withBindMounts([
        {
          source: process.cwd() + '/scripts/init-db.sql',
          target: '/docker-entrypoint-initdb.d/init.sql',
        },
      ])
      .start()
  }, 60000)

  afterEach(async () => {
    if (container !== null) {
      await container.stop()
    }

    await app.close()
  })

  it('database health check', async () => {
    expect(container).toBeDefined()

    const connectionStr = `postgresql://user:password@localhost:5432/test`
    const db = new Pool({ connectionString: connectionStr })

    const result = await db.query('SELECT NOW()')
    expect(result.rows).toBeDefined()

    await db.end()
  })
})
