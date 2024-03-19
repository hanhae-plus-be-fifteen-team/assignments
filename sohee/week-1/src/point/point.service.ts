import { Injectable } from '@nestjs/common'
import { PointHistory, UserPoint } from './point.model'
import { UserPointTable } from 'src/database/userpoint.table'
import { PointHistoryTable } from 'src/database/pointhistory.table'

@Injectable()
export class PointService {
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}

  getOne(id: number): Promise<UserPoint> {
    return this.userDb.selectById(id)
  }

  getHistory(id: number): Promise<PointHistory[]> {
    return this.historyDb.selectAllByUserId(id)
  }

  async charge(id: number, amount: number): Promise<UserPoint> {
    const prevAmount = (await this.getOne(id)).point
    return this.userDb.insertOrUpdate(id, prevAmount + amount)
  }

  async use(id: number, amount: number): Promise<UserPoint> {
    const prevAmount = (await this.getOne(id)).point
    if (prevAmount - amount < 0) {
      console.log('포인트가 부족하여 사용할 수 없습니다.')
      return await this.getOne(id)
    } else {
      return this.userDb.insertOrUpdate(id, prevAmount - amount)
    }
  }
}
