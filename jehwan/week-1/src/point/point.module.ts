import { Module } from '@nestjs/common'
import { PointController } from './point.controller'
import { DatabaseModule } from '../database/database.module'
import { PointHistoryRepository, UserPointRepository } from './point.repository'
import { PointHistoryTable } from '../database/pointhistory.table'
import { UserPointTable } from '../database/userpoint.table'
import { FootprintTable } from '../database/footprint.table'
import { Locks } from './locks'

// 아래 코드를 변경하고 테스트를 돌려주세요.
// case 1. 본 구현 point.service.ts
// case 2. 대조군 (직접 락 구현) point.service.others.ts
// case 3. 대조군 (async mutex) point.service.mutex.ts
import { PointService } from './point.service.others'

@Module({
  imports: [DatabaseModule],
  controllers: [PointController],
  providers: [
    PointService,
    {
      provide: PointHistoryRepository,
      useClass: PointHistoryTable,
    },
    { provide: UserPointRepository, useClass: UserPointTable },
    FootprintTable,
    Locks,
  ],
})
export class PointModule {}
