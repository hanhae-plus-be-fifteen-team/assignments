import { Injectable } from '@nestjs/common'
import { PointHistory, TransactionType, UserPoint } from './point.model'
import { UserPointTable } from '../database/userpoint.table'
import { PointHistoryTable } from '../database/pointhistory.table'

@Injectable()
export class PointService {
  private writeLock: boolean = false

  constructor(
    private readonly userPointTable: UserPointTable,
    private readonly pointHistoryTable: PointHistoryTable,
  ) {}

  /**
   *
   * @param userId user to charge
   * @param amount amount to charge
   * @returns balance after charge
   */
  async charge(userId: number, amount: number): Promise<UserPoint> {
    // critical section
    await this.waitWriteLock()
    this.writeLock = true

    const userPointBeforeUpsert = await this.userPointTable.selectById(userId)

    const userPointAfterUpsert = await this.userPointTable.insertOrUpdate(
      userId,
      userPointBeforeUpsert.point + amount,
    )

    await this.pointHistoryTable.insert(
      userId,
      amount,
      TransactionType.CHARGE,
      userPointAfterUpsert.updateMillis,
    )

    this.writeLock = false
    // critical section end

    return userPointAfterUpsert
  }

  /**
   *
   * @param userId user to use
   * @param amount amount to use
   * @returns balance after use
   */
  async use(userId: number, amount: number): Promise<UserPoint> {
    const userPointBeforeUpsert = await this.userPointTable.selectById(userId)

    const pointToUpsert = userPointBeforeUpsert.point - amount

    if (pointToUpsert < 0) {
      throw new Error('Limit Exceeded')
    }

    const userPointAfterUpsert = await this.userPointTable.insertOrUpdate(
      userId,
      pointToUpsert,
    )

    await this.pointHistoryTable.insert(
      userId,
      amount,
      TransactionType.USE,
      userPointAfterUpsert.updateMillis,
    )

    return userPointAfterUpsert
  }

  /**
   *
   * @param userId user to read
   * @returns user's point
   */
  async readPoint(userId: number): Promise<UserPoint> {
    return this.userPointTable.selectById(userId)
  }

  /**
   *
   * @param userId user to read
   * @returns user's histories
   */
  async readHistories(userId: number): Promise<PointHistory[]> {
    return this.pointHistoryTable.selectAllByUserId(userId)
  }

  /**
   *
   * busy waiting
   * @param interval checking interval (default 10ms)
   */
  private waitWriteLock(interval?: number) {
    return new Promise(resolve => {
      const checkLock = () => {
        if (this.writeLock) {
          setTimeout(checkLock, interval ?? 10)
        } else {
          resolve(true)
        }
      }
      checkLock()
    })
  }
}
