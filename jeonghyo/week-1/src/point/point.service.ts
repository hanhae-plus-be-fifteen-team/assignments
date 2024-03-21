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
        await this.insertHistory(userId, amount, TransactionType.CHARGE, afterUpdate.updateMillis);
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
        await this.insertHistory(userId, amount, TransactionType.USE, afterUpdate.updateMillis);
        return afterUpdate;
    }

    // charge, use에서 history insert를 비동기로 실행하기 위함(실패 했을 때 반복 요청하는 코드 추가해야함)
    private async insertHistory(
        userId: number,
        amount: number,
        transactionType: TransactionType,
        updateMillis: number,
    ): Promise<void> {
        // 비동기적으로 실행할 작업을 추가
        await this.historyDb.insert(userId, amount, transactionType, updateMillis);
    }
    
}
