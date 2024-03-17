import { Injectable } from '@nestjs/common'
import { PointHistory, UserPoint } from './point.model'
import { UserPointTable } from '../database/userpoint.table'

@Injectable()
export class PointService {
  constructor() {}

  /**
   *
   * @param userId user to charge
   * @param amount amount to charge
   * @returns balance after charge
   */
  async charge(userId: number, amount: number): Promise<number> {
    return
  }

  /**
   *
   * @param userId user to use
   * @param amount amount to use
   * @returns balance after use
   */
  async use(userId: number, amount: number): Promise<number> {
    return 0
  }

  /**
   *
   * @param userId user to read
   * @returns user's point
   */
  async readPoint(userId: number): Promise<UserPoint> {
    return undefined
  }

  /**
   *
   * @param userId user to read
   * @returns user's histories
   */
  async readHistories(userId: number): Promise<PointHistory[]> {
    return []
  }
}
