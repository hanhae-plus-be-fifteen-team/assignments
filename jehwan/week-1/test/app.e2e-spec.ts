import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import supertest from 'supertest'
import { AppModule } from '../src/app.module'

describe('AppController (e2e)', () => {
  let app: INestApplication
  const aggregated: Record<string, number> = {}

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  beforeEach(async () => {
    // 테스트 실패 방지를 위해 초기 금액 충전
    await request(app.getHttpServer())
      .patch('/point/1/charge?label=Init')
      .send({
        amount: 1000000,
      })
  })

  it.each(
    // 통계를 위해 200번 테스트를 돌림
    Array.from({ length: 200 }, (_, i) => i),
  )('비동기 순차 처리 순서 확인 %i', async i => {
    const requests = [
      request(app.getHttpServer()).patch('/point/1/charge?label=A').send({
        amount: 10000,
      }),
      request(app.getHttpServer()).patch('/point/1/use?label=B').send({
        amount: 50000,
      }),
      request(app.getHttpServer()).patch('/point/1/use?label=C').send({
        amount: 30000,
      }),
      request(app.getHttpServer()).patch('/point/1/charge?label=D').send({
        amount: 20000,
      }),
    ]

    const responses = await Promise.allSettled(requests)
    expect(isAllFulfilled(responses)).toBeTruthy()

    const footprints = await request(app.getHttpServer()).get(
      '/point/footprints',
    )

    expect(footprints.body).toBeInstanceOf(Array)

    // 기록
    const groupId = footprints.body.join(' -> ')

    if (!aggregated[groupId]) aggregated[groupId] = 0
    aggregated[groupId] += 1
  })

  afterAll(() => {
    // 최종적으로 확인
    console.log(aggregated)
  })
})

function isAllFulfilled(
  requests: PromiseSettledResult<supertest.Response>[],
): requests is PromiseFulfilledResult<supertest.Response>[] {
  return !requests.some(r => r.status === 'rejected')
}
