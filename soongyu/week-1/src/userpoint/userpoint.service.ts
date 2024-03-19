import { Injectable } from '@nestjs/common'
import { PointHistoryTable } from 'src/database/pointhistory.table'
import { UserPointTable } from 'src/database/userpoint.table'
import { UserPoint, PointHistory } from 'src/point/point.model'
import { PointBody as PointDto } from '../point/point.dto'

@Injectable()
export class UserPointService {
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}

  async chargePoint(id: number, pointDto: PointDto): Promise<UserPoint> {
    return null
  }
  async usePoint(id: number, pointDto: PointDto): Promise<UserPoint> {
    return null
  }
  async getUserPoint(id: number): Promise<UserPoint> {
    return await this.userDb.selectById(id)
  }
  async getUserPointHistory(id: number): Promise<PointHistory[]> {
    return await this.historyDb.selectAllByUserId(id)
  }
}
