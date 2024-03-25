/**
 * 출처: https://github.com/hanghae-plus-backend/yunji-user-point/blob/main/src/point/point.service.ts
 */
import { Injectable } from '@nestjs/common'
import { PointHistoryTable } from '../database/pointhistory.table'
import { UserPointTable } from '../database/userpoint.table'
import { PointHistory, TransactionType, UserPoint } from './point.model'
import { Locks } from './locks'
import { FootprintTable } from '../database/footprint.table'
// import { NotEnoughPointsError } from './error/NotEnoughPointsError'
// import { UserNotFoundError } from './error/UserNotFoundError'

@Injectable()
export class PointService {
  constructor(
    private readonly locks: Locks,
    private readonly userDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
    private readonly footprintTable: FootprintTable,
  ) {}

  async readPoint(id: number): Promise<UserPoint> {
    return await this.userDb.selectById(id)
  }

  async readHistories(id: number): Promise<PointHistory[]> {
    return await this.historyDb.selectAllByUserId(id)
  }

  async charge(id: number, amount: number, label?: string): Promise<UserPoint> {
    let currentPoint: UserPoint
    let updateResultUserDB: UserPoint
    await this.locks.executeOnLock(
      async () => {
        try {
          currentPoint = await this.userDb.selectById(id)
        } catch (error) {
          throw error
        }

        try {
          updateResultUserDB = await this.userDb.insertOrUpdate(
            id,
            currentPoint.point + amount,
          )
        } catch (error) {
          throw error
        }

        try {
          const { id: resultId, point, updateMillis } = updateResultUserDB

          const transactionType = TransactionType.CHARGE

          await this.historyDb.insert(
            resultId,
            point,
            transactionType,
            updateMillis,
          )

          // 흔적 남기기 추가
          this.footprintTable.print(label)
        } catch (error) {
          updateResultUserDB = await this.userDb.insertOrUpdate(
            id,
            currentPoint.point,
          )
          throw error
        }
      },
      { userId: id, amount },
    )

    return updateResultUserDB
  }

  async use(id: number, amount: number, label?: string): Promise<UserPoint> {
    let currentPoint: UserPoint
    let updateResultUserDB: UserPoint
    let updateResultHistoryDB: PointHistory
    await this.locks.executeOnLock(
      async () => {
        try {
          currentPoint = await this.userDb.selectById(id)
        } catch (error) {
          throw error
        }

        try {
          updateResultUserDB = await this.userDb.insertOrUpdate(
            id,
            currentPoint.point - amount,
          )
        } catch (error) {
          throw error
        }

        try {
          const { id: resultId, point, updateMillis } = updateResultUserDB
          const transactionType = TransactionType.USE

          updateResultHistoryDB = await this.historyDb.insert(
            resultId,
            point,
            transactionType,
            updateMillis,
          )

          // 흔적 남기기 추가
          this.footprintTable.print(label)
        } catch (error) {
          updateResultUserDB = await this.userDb.insertOrUpdate(
            id,
            currentPoint.point,
          )
          throw error
        }
      },
      { userId: id, amount },
    )

    return updateResultUserDB
  }

  footprints() {
    return this.footprintTable.footprints
  }
}
