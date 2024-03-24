import { Module } from '@nestjs/common'
import { PointController } from './point.controller'
import { DatabaseModule } from '../database/database.module'
import { PointService } from './point.service'
import { PointHistoryRepository, UserPointRepository } from './point.repository'
import { PointHistoryTable } from '../database/pointhistory.table'
import { UserPointTable } from '../database/userpoint.table'
import { FootprintTable } from '../database/footprint.table'

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
  ],
})
export class PointModule {}
