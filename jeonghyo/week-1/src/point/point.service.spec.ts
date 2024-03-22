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

  describe('insertHistory', () => {
    const userId = 1;
      const amount = 10;
      const transactionType = TransactionType.CHARGE;
      const updateMillis = Date.now();

    it('Inserting history check', async () => {
      // 성공 케이스
      await service.insertHistory(userId, amount, transactionType, updateMillis);
      const chargeHistory = await service.history(1);
      expect(chargeHistory.length).toBe(1);
    })

    it('Inserting history retry check', async () => {
      // 한번 실패 케이스
      const mockInsert = jest.fn();
      mockInsert.mockRejectedValueOnce(new Error('Simulated error'));               
      historyDb.insert = mockInsert;
  
      await service.insertHistory(userId, amount, transactionType, updateMillis);
      expect(mockInsert).toHaveBeenCalledTimes(2);
    });
  });
});
