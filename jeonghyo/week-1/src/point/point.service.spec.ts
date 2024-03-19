import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';

describe('PointService', () => {
  let provider: PointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PointService],
    }).compile();

    provider = module.get<PointService>(PointService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
