import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { createConnection } from '../src/database'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let container: StartedTestContainer | null = null

  process.env.DB_USER = 'user'
  process.env.DB_PASSWORD = 'password'
  process.env.DB_NAME = 'test'

  beforeEach(async () => {
    console.log('Initialize PG Container ...')
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
    console.log('Initialize PG Container Done')

    const mappedPort = container.getMappedPort(5432)
    process.env.DB_PORT = mappedPort.toString()

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  }, 100000)

  afterEach(async () => {
    await app.close()

    if (container !== null) {
      await container.stop()
    }
  })

  it('database health check', async () => {
    expect(container).toBeDefined()

    const pool = createConnection()

    const result = await pool.query('SELECT NOW()')
    expect(result.rows).toBeDefined()

    await pool.end()
  })

  describe('PATCH /special-lectures/1/application', () => {
    it('should succeed to apply for the lecture', async () => {
      const response = await request(app.getHttpServer()).patch(
        '/special-lectures/1/application',
      )

      expect(response.body).toMatchObject({
        applied: true,
        userId: 1,
      })
    })
  })
})
