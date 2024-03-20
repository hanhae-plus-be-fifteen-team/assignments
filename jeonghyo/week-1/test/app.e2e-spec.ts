import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { TransactionType } from '../src/point/point.model';

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  describe('PointService Test', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .patch('/point/1/charge').send({ amount: 1000 });
    });
    // 음수 입력 상황 예외 처리
    it('Minus Charge Test', async () => {
      await request(app.getHttpServer())
      .patch('/point/1/charge')
      .send({
        amount: -1000,
      })
      .expect(500);
    });
    // 음수 입력 상황 예외 처리
    it('Minus Use Test', async () => {
      await request(app.getHttpServer())
      .patch('/point/1/use')
      .send({
        amount: -1000,
      })
      .expect(500);
    });
    // 보유 포인트보다 많이 사용할 때 예외 처리
    it('Use More Then Charged Point Test', async () => {
      await request(app.getHttpServer())
      .patch('/point/1/use')
      .send({
        amount: 2000,
      })
      .expect(500);
    });
  });

  describe('Sequential Execution Test', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .patch('/point/1/charge').send({ amount: 1000 });
      await request(app.getHttpServer())
        .patch('/point/1/use').send({ amount: 500 });
      await request(app.getHttpServer())
        .patch('/point/1/charge').send({ amount: 1000 });
    });
    // 입력 순서대로 실행되는지 확인
    it('History Order', async () => {
      const res = await request(app.getHttpServer())
        .get('/point/1/histories')
        .expect(200);
      expect(res.body[0].type).toBe(TransactionType.CHARGE);
      expect(res.body[1].type).toBe(TransactionType.USE);
      expect(res.body[2].type).toBe(TransactionType.CHARGE);
    });
  });
})
