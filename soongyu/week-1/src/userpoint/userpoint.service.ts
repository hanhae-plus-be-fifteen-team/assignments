import { Injectable } from '@nestjs/common'
import { PointHistoryTable } from 'src/database/pointhistory.table'
import { UserPointTable } from 'src/database/userpoint.table'
import { UserPoint, PointHistory } from 'src/point/point.model'

@Injectable()
export class UserPointService {
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}
}
