import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { UserPointTable } from "../database/userpoint.table";
import { PointHistoryTable } from "../database/pointhistory.table";
import { TransactionType } from './point.model';

describe('PointService', () => {
  let service: PointService;
  let userDb: UserPointTable;
  let historyDb: PointHistoryTable;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointService, UserPointTable, PointHistoryTable],
    }).compile();

    service = module.get<PointService>(PointService);
    userDb = module.get<UserPointTable>(UserPointTable);
    historyDb = module.get<PointHistoryTable>(PointHistoryTable);
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
        expect(e.message).toEqual('amount should be larger than 0');
      }      
    });
    // 포인트 충전 테스트
    it('Charge Point Check', async () => {
      await service.charge(1, 1000);     
      const chargePoint = await service.point(1);
      expect(chargePoint.point).toBe(1000);
      const chargeHistory = await service.history(1);
      expect(chargeHistory.length).toBe(1);
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
        expect(e.message).toEqual('amount should be larger than 0');
      }      
    });
    // 포인트 사용 테스트
    it('Use Point Check', async () => {
      await service.use(1, 1000);
      const usePoint = await service.point(1);
      expect(usePoint.point).toBe(4000);
      const useHistory = await service.history(1);
      expect(useHistory.length).toBe(2);
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
