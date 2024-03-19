import { Injectable } from '@nestjs/common'
import { PointHistoryTable } from '../database/pointhistory.table'
import { UserPointTable } from '../database/userpoint.table'
import { UserPoint, PointHistory, TransactionType } from '../point/point.model'
import { PointBody as PointDto } from './point.dto'

@Injectable()
export class UserPointService {
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}
}
