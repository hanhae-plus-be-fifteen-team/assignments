import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { Application } from 'src/special-lectures/models/application.model'
import { SpecialLectureExceptionMessage } from '../src/special-lectures/models/special-lecture.excpetion.model'
import { faker } from '@faker-js/faker'

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

  let lectureId: string
  let userId: string
  let others: string[]

  beforeEach(async () => {
    // prepare a new lecture for the e2e test
    const lectureResponse = await request(app.getHttpServer())
      .post(`/special-lectures`)
      .send({
        title: '취업 뽀개기 특강',
        openingDate: new Date().toISOString(),
        maximum: 30,
      })

    // prepare a user for the e2e test
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        username: 'david',
      })

    others = []
    for (let i = 0; i < 30; i++) {
      const other = await request(app.getHttpServer()).post(`/users`).send({
        username: faker.lorem.word(),
      })
      others.push(other.body.id)
    }

    lectureId = lectureResponse.body.id
    userId = userResponse.body.id
  })

  /**
   * (핵심) 특강 신청 API
   */
  describe('PATCH /special-lectures/:lecture_id/applications/:user_id', () => {
    it('should succeed to apply for the lecture', async () => {
      const response = await request(app.getHttpServer()).patch(
        `/special-lectures/${lectureId}/applications/${userId}`,
      )

      const { status, body } = response

      expect(status).toBe(200)
      expectApplication(body, lectureId, userId, true)
    })

    it('should fail to apply for the lecture if the user already applied', async () => {
      // send the same request twice
      await request(app.getHttpServer()).patch(
        `/special-lectures/${lectureId}/applications/${userId}`,
      )
      await request(app.getHttpServer())
        .patch(`/special-lectures/${lectureId}/applications/${userId}`)
        .expect(400)
        .expect({
          message: SpecialLectureExceptionMessage.ALREADY_APPLIED,
          error: 'Bad Request',
          statusCode: 400,
        })
    })

    it('A user should not be able to apply if there are already 30 applications', async () => {
      /**
       * apply for the lecture 30 times
       */
      for (const otherId of others) {
        await request(app.getHttpServer()).patch(
          `/special-lectures/${lectureId}/applications/${otherId}`,
        )
      }
      /**
       * 31'th applicant 😭
       */
      await request(app.getHttpServer())
        .patch(`/special-lectures/${lectureId}/applications/${userId}`)
        .expect(400)
        .expect({
          message: SpecialLectureExceptionMessage.LIMIT_EXCEEDED,
          error: 'Bad Request',
          statusCode: 400,
        })
    }, 10000)

    it('should not be possible to apply before the opening date', async () => {
      const lectureResponse = await request(app.getHttpServer())
        .post(`/special-lectures`)
        .send({
          title: '스파르타 코딩클럽 취업 특강',
          openingDate: faker.date.future({ refDate: new Date() }),
          maximum: 30,
        })

      const lectureId = lectureResponse.body.id
      await request(app.getHttpServer())
        .patch(`/special-lectures/${lectureId}/applications/${userId}`)
        .expect(400)
        .expect({
          message: SpecialLectureExceptionMessage.NOT_OPEN_YET,
          error: 'Bad Request',
          statusCode: 400,
        })
    })
  })

  /**
   * (기본) 특강 신청 완료 여부 조회 API
   */
  describe('GET /special-lectures/:lecture_id/applications/:user_id', () => {
    let secondUser: string

    beforeEach(async () => {
      // prepare application for the e2e test
      await request(app.getHttpServer()).patch(
        `/special-lectures/${lectureId}/applications/${userId}`,
      )

      // prepare a user for the e2e test
      const userResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'john',
        })

      secondUser = userResponse.body.id
    })

    it('should succeed to read applied === true for the lecture', async () => {
      const response = await request(app.getHttpServer()).get(
        `/special-lectures/${lectureId}/applications/${userId}`,
      )

      const { status, body } = response
      expect(status).toBe(200)
      expectApplication(body, lectureId, userId, true)
    })

    it('should succeed to read applied === false for the lecture', async () => {
      const response = await request(app.getHttpServer()).get(
        `/special-lectures/${lectureId}/applications/${secondUser}`,
      )
      const { status, body } = response

      expect(status).toBe(200)
      expectApplication(body, lectureId, secondUser, false)
    })
  })

  /**
   * (선택) 특강 선택 API
   */
  describe('GET /special-lectures', () => {
    it('should list all special-lectures and a user can select any lecture', async () => {
      const lectureIds: string[] = []

      for (let i = 0; i < 5; i++) {
        const lectureResponse = await request(app.getHttpServer())
          .post(`/special-lectures`)
          .send({
            title: faker.lorem.words(3),
            openingDate: faker.date.past({ refDate: new Date() }),
            maximum: 30,
          })

        lectureIds.push(lectureResponse.body.id)
      }

      await request(app.getHttpServer())
        .patch(
          `/special-lectures/${faker.helpers.arrayElement(lectureIds)}/applications/${userId}`,
        )
        .expect(200)
    })
  })
})

function expectApplication(
  body: Record<keyof Application, unknown>,
  lectureId: string,
  userId: string,
  applied: boolean,
) {
  expect(body.lectureId).toBe(lectureId)
  expect(body.userId).toBe(userId)
  expect(body.applied).toBe(applied)

  if (applied) {
    expect(body.timestamp).toMatch(
      /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+Z?/,
    )
  } else {
    expect(body.timestamp).toBe(null)
  }
}
