import { Injectable } from '@nestjs/common';
import { PointHistory, TransactionType, UserPoint } from "./point.model";
import { UserPointTable } from "../database/userpoint.table";
import { PointHistoryTable } from "../database/pointhistory.table";

@Injectable()
export class PointService {

    constructor(
        private readonly userDb: UserPointTable,
        private readonly historyDb: PointHistoryTable,
    ) {}

    async point(userId: number): Promise<UserPoint> {
        return this.userDb.selectById(userId);
    }

    async history(userId: number): Promise<PointHistory[]> {
        return this.historyDb.selectAllByUserId(userId);
    }

    async charge(
        userId: number,
        amount: number,
    ): Promise<UserPoint> {
        let beforeUpdate: UserPoint;
        if (amount < 0) throw new Error('amount should be larger than 0');
        beforeUpdate = await this.userDb.selectById(userId);
        const calcPoint = beforeUpdate.point + amount;
        const afterUpdate = await this.userDb.insertOrUpdate(userId, calcPoint);
        // insertHistory의 결과를 기다리지 않고 넘어감
        this.insertHistory(userId, amount, TransactionType.CHARGE, afterUpdate.updateMillis);
        return afterUpdate;
    }

    async use(
        userId: number,
        amount: number,
    ): Promise<UserPoint> {
        let beforeUpdate: UserPoint;
        if (amount < 0) throw new Error('amount should be larger than 0');
        beforeUpdate = await this.userDb.selectById(userId);
        const calcPoint = beforeUpdate.point - amount;
        if (calcPoint < 0) throw new Error('Balance Insufficient');
        const afterUpdate = await this.userDb.insertOrUpdate(userId, calcPoint);
        // insertHistory의 결과를 기다리지 않고 넘어감
        this.insertHistory(userId, amount, TransactionType.USE, afterUpdate.updateMillis);
        return afterUpdate;
    }

    // history insert를 비동기로 실행
    async insertHistory(
        userId: number,
        amount: number,
        transactionType: TransactionType,
        updateMillis: number
    ): Promise<void> {
        let retries = 3; // 최대 재시도 횟수
        while (retries > 0) {
            try {
                await this.historyDb.insert(userId, amount, transactionType, updateMillis);
                return; // 성공적으로 삽입되면 함수 종료
            } catch (error) {
                console.warn('Inserting history failed. Retrying...');
                retries--;
            }
        }
        throw new Error('Failed to insert history after maximum retries.');
    }
}
