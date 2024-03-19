import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { UserPointTable } from "../database/userpoint.table";
import { PointHistoryTable } from "../database/pointhistory.table";
import { TransactionType } from './point.model';

describe('PointService', () => {
  let service: PointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointService, UserPointTable, PointHistoryTable],
    }).compile();

    service = module.get<PointService>(PointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('PointService.point()', () => {  
    // 아이디별 포인트 조회 테스트
    it('Point Check', async  () => {
      await service.charge(1, 1000);
      const userPoint = await service.point(1);
      expect(userPoint).toMatchObject({
        id: 1,
        point: 1000
      });
    });
  });

  describe('PointService.history()', () => {
    beforeEach(async () => {
      await service.charge(1, 10000);
      await service.charge(2, 10000);
      await service.use(1, 1000);
      await service.use(2, 1000);
    })
    it('Point History Check', async () => {    
      // 내역 검색 테스트
      const userHistory_1 = await service.history(1);
      expect(userHistory_1).toBeInstanceOf(Array);
      expect(userHistory_1.length).toEqual(2);
      expect(userHistory_1[0]).toMatchObject({
        userId: 1,
        type: TransactionType.CHARGE
      });
      expect(userHistory_1[1]).toMatchObject({
        userId: 1,
        type: TransactionType.USE
      });
    });
  });

  describe('PointService.charge()', () => {
    // 음수 입력 상황 테스트
    it('Charge Amount Check', async () => {
      try{
        await service.charge(1, -1000);
      } catch(e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual('amount should larger then 0');
      }      
    });
    // 포인트 충전 테스트
    it('Charge Point Check', async () => {
      const firstCharge = await service.charge(1, 1000);
      expect(firstCharge.point).toEqual(1000);
      const secondCharge = await service.charge(1, 500);
      expect(secondCharge.point).toEqual(1500);
    });
  });

  describe('PointService.use()', () => {
    beforeEach(async () => {
      await service.charge(1, 5000);
    });
    // 음수 입력 상황 테스트
    it('Use Amount Check', async () => {
      try{
        await service.use(1, -1000);
      } catch(e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual('amount should larger then 0');
      }      
    });
    // 포인트 사용 테스트
    it('Use Point Check', async () => {
      const usePoint = await service.use(1, 1000);
      expect(usePoint.point).toEqual(4000);
    });
    // 보유 포인트보다 많이 사용한 상황 테스트
    it('Use More Point Check', async () => {
      try{
        await service.use(1, 6000);
      } catch(e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual('Balance Insufficient');
      }
    });
  });

  describe('Sequential Execution Test', () => {
    beforeEach(async () => {
      await service.charge(1, 10000);
      await service.charge(1, 1000);
      await service.use(1, 2000);
      await service.use(1, 3000);
      await service.charge(1, 4000);
    });
    it('Sequential Execution Check', async () => {
      const userHistory = await service.history(1);
      // 요청한 포인트 사용 내역이 모두 입력되었는지 확인
      expect(userHistory.length).toEqual(5);

      // 요청한 순서대로 내역이 입력되었는지 확인
      expect(userHistory[0]).toMatchObject({
        type: TransactionType.CHARGE,
        amount: 10000
      });
      expect(userHistory[1]).toMatchObject({
        type: TransactionType.CHARGE,
        amount: 1000
      });
      expect(userHistory[2]).toMatchObject({
        type: TransactionType.USE,
        amount: 2000
      });
      expect(userHistory[3]).toMatchObject({
        type: TransactionType.USE,
        amount: 3000
      });
      expect(userHistory[4]).toMatchObject({
        type: TransactionType.CHARGE,
        amount: 4000
      });
    });
  });
});
