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

  async getUserPoint(id: number): Promise<UserPoint> {
    return await this.userDb.selectById(id)
  }

  async chargePoint(id: number, pointDto: PointDto): Promise<UserPoint> {
    const addedAmount = pointDto.amount
    if (addedAmount <= 0) {
      throw new Error('양의 정수만 입력 가능합니다.')
    }
    const prevUserPoint: number = (await this.getUserPoint(id)).point
    await this.historyDb.insert(
      id,
      addedAmount,
      TransactionType.CHARGE,
      Date.now(),
    )
    return await this.userDb.insertOrUpdate(id, prevUserPoint + addedAmount)
  }

  async usePoint(id: number, pointDto: PointDto): Promise<UserPoint> {
    const usedAmount = pointDto.amount
    if (usedAmount <= 0) {
      throw new Error('양의 정수만 입력 가능합니다.')
    }
    const prevUserPoint: number = (await this.getUserPoint(id)).point
    if (prevUserPoint - usedAmount < 0) {
      throw new Error('포인트가 부족합니다.')
    }
    await this.historyDb.insert(id, usedAmount, TransactionType.USE, Date.now())
    return await this.userDb.insertOrUpdate(id, prevUserPoint - usedAmount)
  }
}
