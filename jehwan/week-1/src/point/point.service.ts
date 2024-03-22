import { Injectable } from '@nestjs/common'
import { PointHistory, TransactionType, UserPoint } from './point.model'
import { PointHistoryRepository, UserPointRepository } from './point.repository'

@Injectable()
export class PointService {
  private writeLockTable: Record<number, boolean> = {}

  constructor(
    private readonly userPointRepository: UserPointRepository,
    private readonly pointHistoryRepository: PointHistoryRepository,
  ) {}

  /**
   *
   * @param userId user to charge
   * @param amount amount to charge
   * @returns balance after charge
   */
  async charge(userId: number, amount: number): Promise<UserPoint> {
    if (amount < 0) {
      throw Error('The amount must be greater than and equal to 0')
    }

    // critical section
    await this.waitWriteLock(userId)
    this.writeLockTable[userId] = true

    const userPointBeforeUpsert =
      await this.userPointRepository.selectById(userId)

    const userPointAfterUpsert = await this.userPointRepository.insertOrUpdate(
      userId,
      userPointBeforeUpsert.point + amount,
    )

    this.writeLockTable[userId] = false
    // critical section end

    await this.pointHistoryRepository.insert(
      userId,
      amount,
      TransactionType.CHARGE,
      userPointAfterUpsert.updateMillis,
    )

    return userPointAfterUpsert
  }

  /**
   *
   * @param userId user to use
   * @param amount amount to use
   * @returns balance after use
   */
  async use(userId: number, amount: number): Promise<UserPoint> {
    // critical section
    await this.waitWriteLock(userId)
    this.writeLockTable[userId] = true

    const userPointBeforeUpsert =
      await this.userPointRepository.selectById(userId)

    const pointToUpsert = userPointBeforeUpsert.point - amount

    if (pointToUpsert < 0) {
      this.writeLockTable[userId] = false
      throw new Error('Limit Exceeded')
    }

    const userPointAfterUpsert = await this.userPointRepository.insertOrUpdate(
      userId,
      pointToUpsert,
    )

    this.writeLockTable[userId] = false
    // critical section end

    await this.pointHistoryRepository.insert(
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
    return this.userPointRepository.selectById(userId)
  }

  /**
   *
   * @param userId user to read
   * @returns user's histories
   */
  async readHistories(userId: number): Promise<PointHistory[]> {
    return this.pointHistoryRepository.selectAllByUserId(userId)
  }

  /**
   *
   * busy waiting
   * @param userId user's ID
   * @param interval checking interval (default 10ms)
   */
  private waitWriteLock(userId: number, interval?: number) {
    return new Promise(resolve => {
      const checkLock = () => {
        if (this.writeLockTable[userId]) {
          setTimeout(checkLock, interval ?? 10)
        } else {
          resolve(true)
        }
      }
      checkLock()
    })
  }
}
