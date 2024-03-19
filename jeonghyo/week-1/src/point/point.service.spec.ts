import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';

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
});
