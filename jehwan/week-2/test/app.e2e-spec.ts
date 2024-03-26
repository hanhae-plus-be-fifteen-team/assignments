import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { createDb } from '../src/database'

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

    it('should fail to apply for the lecture if the user already applied', async () => {
      await request(app.getHttpServer()).patch(
        '/special-lectures/1/application',
      )

      await request(app.getHttpServer())
        .patch('/special-lectures/1/application')
        .expect(400)
        .expect({
          message: 'Already Applied',
          error: 'Bad Request',
          statusCode: 400,
        })
    })

    it('Applications should be processed sequentially even with concurrent requests', async () => {
      const users = Array.from({ length: 30 }, (_, i) => i)

      const requests = users.map(user =>
        request(app.getHttpServer()).patch(
          `/special-lectures/${user}/application`,
        ),
      )

      // race! 🚗
      await Promise.allSettled(requests)

      const pg = createDb()
      const applications = await pg.many(
        'SELECT * FROM special_lectures ORDER BY created_at',
      )

      // If the sequence is guaranteed, the reservations should be in ascending order of userId.
      expect(applications.map(app => app.user_id)).toEqual(users)
    }, 30000)
  })
})
