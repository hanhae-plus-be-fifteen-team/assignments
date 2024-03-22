import { BadRequestException, Injectable } from '@nestjs/common'
import { PointHistory, TransactionType, UserPoint } from './point.model'
import { UserPointTable } from '../database/userpoint.table'
import { PointHistoryTable } from '../database/pointhistory.table'

@Injectable()
export class PointService {
  constructor(
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}

  async getOne(id: number): Promise<UserPoint> {
    try {
      return await this.userDb.selectById(id)
    } catch (e) {
      throw new Error(e)
    }
  }

  async getHistory(id: number): Promise<PointHistory[]> {
    return await this.historyDb.selectAllByUserId(id)
  }

  async charge(id: number, amount: number): Promise<UserPoint> {
    if (amount < 0) throw new BadRequestException()
    const prev = await this.getOne(id)
    const updatedUserPoint = await this.userDb.insertOrUpdate(
      id,
      prev.point + amount,
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
    const prev = await this.getOne(id)
    if (amount < 0) throw new BadRequestException()
    if (prev.point - amount < 0) return await this.getOne(id)
    const updatedUserPoint = await this.userDb.insertOrUpdate(
      id,
      prev.point - amount,
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
