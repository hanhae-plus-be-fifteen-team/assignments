import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { TransactionType } from './point.model';

describe('PointService', () => {
  let service: PointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointService],
    }).compile();

    service = module.get<PointService>(PointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('PointService.point()', () => {
    beforeEach(async () => {
      const userId = 1;
      await service.charge(userId, 1000);
    });
    // 포인트 입력 테스트
    it('Point Check', async  () => {
      const userPoint = await service.point(1);
      expect(userPoint.id).toEqual(1);
      expect(userPoint.point).toEqual(1000);
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
      expect(userHistory_1[0].userId).toEqual(1);
      expect(userHistory_1[0].type).toEqual(TransactionType.CHARGE);
      expect(userHistory_1[1].userId).toEqual(1);
      expect(userHistory_1[1].type).toEqual(TransactionType.USE);
    });
  });
});