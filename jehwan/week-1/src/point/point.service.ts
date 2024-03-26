import { Injectable } from '@nestjs/common'
import { PointHistory, TransactionType, UserPoint } from './point.model'
import { PointHistoryRepository, UserPointRepository } from './point.repository'
import { Mutex } from 'async-mutex'

@Injectable()
export class PointService {
  private writeLockTable: Record<number, Mutex> = {}

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

    const mutex = this.getMutex(userId)
    const release = await mutex.acquire()

    const userPointBeforeUpsert =
      await this.userPointRepository.selectById(userId)

    const userPointAfterUpsert = await this.userPointRepository.insertOrUpdate(
      userId,
      userPointBeforeUpsert.point + amount,
    )

    release()

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
    const mutex = this.getMutex(userId)
    const release = await mutex.acquire()

    const userPointBeforeUpsert =
      await this.userPointRepository.selectById(userId)

    const pointToUpsert = userPointBeforeUpsert.point - amount

    if (pointToUpsert < 0) {
      release()
      throw new Error('Limit Exceeded')
    }

    const userPointAfterUpsert = await this.userPointRepository.insertOrUpdate(
      userId,
      pointToUpsert,
    )

    release()

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

  private getMutex(userId: number): Mutex {
    if (!this.writeLockTable[userId]) {
      this.writeLockTable[userId] = new Mutex()
      return this.writeLockTable[userId]
    }
    return this.writeLockTable[userId]
  }
}
