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
        if (amount < 0) throw new Error('amount should larger then 0');
        const beforeUpdate = await this.userDb.selectById(userId);
        const calcPoint = beforeUpdate.point + amount;
        const afterUpdate = await this.userDb.insertOrUpdate(userId, calcPoint);
        await this.historyDb.insert(userId, amount, TransactionType.CHARGE, afterUpdate.updateMillis);
        return afterUpdate;
    }

    async use(
        userId: number,
        amount: number,
    ): Promise<UserPoint> {
        if (amount < 0) throw new Error('amount should larger then 0')
        const beforeUpdate = await this.userDb.selectById(userId);
        const calcPoint = beforeUpdate.point - amount
        if (calcPoint < 0) throw new Error('Balance Insufficient')
        const afterUpdate = await this.userDb.insertOrUpdate(userId, calcPoint);
        await this.historyDb.insert(userId, amount, TransactionType.USE, afterUpdate.updateMillis);
        return afterUpdate;
    }
    
}
