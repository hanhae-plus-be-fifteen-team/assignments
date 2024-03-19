import { Injectable } from '@nestjs/common'
import { PointHistory, TransactionType, UserPoint } from './point.model'
import { UserPointTable } from '../database/userpoint.table'
import { PointHistoryTable } from '../database/pointhistory.table'

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
    const updatedUserPoint = await this.userDb.insertOrUpdate(
      id,
      prevAmount + amount,
    )
    await this.historyDb.insert(
      id,
      amount,
      TransactionType.CHARGE,
      updatedUserPoint.updateMillis,
    )
    return updatedUserPoint
  }

  async use(id: number, amount: number): Promise<UserPoint> {
    const prevAmount = (await this.getOne(id)).point
    if (prevAmount - amount < 0) {
      console.log('포인트가 부족하여 사용할 수 없습니다.')
      return await this.getOne(id)
    } else {
      const updatedUserPoint = await this.userDb.insertOrUpdate(
        id,
        prevAmount - amount,
      )
      await this.historyDb.insert(
        id,
        amount,
        TransactionType.USE,
        updatedUserPoint.updateMillis,
      )
      return updatedUserPoint
    }
  }
}
