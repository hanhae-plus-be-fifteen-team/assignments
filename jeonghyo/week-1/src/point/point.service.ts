import { Injectable } from '@nestjs/common';
import { PointHistory, TransactionType, UserPoint } from "./point.model";
import { UserPointTable } from "../database/userpoint.table";
import { PointHistoryTable } from "../database/pointhistory.table";

@Injectable()
export class PointService {

    private readonly mutexes = [];

    constructor(
        private readonly userDb: UserPointTable,
        private readonly historyDb: PointHistoryTable,
    ) {}

    private getMutexIndex(userId: number): number {
        // userId를 해시하여 mutex 배열의 인덱스를 반환(모든 userId에 대해 락을 관리할 때의 부담 감소. 하지만 너무 많은 유저가 있으면 다른 방식이 필요해 보임)
        return userId % this.mutexes.length;
    }

    private async withLock(userId: number, fn: () => Promise<any>): Promise<any> {
        const mutexIndex = this.getMutexIndex(userId);
        const mutex = this.mutexes[mutexIndex] || (this.mutexes[mutexIndex] = {});

        // 락 획득
        while (mutex[userId]) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 잠시 대기
        }
        mutex[userId] = true;

        try {
            return await fn();
        } finally {
            // 락 해제
            mutex[userId] = false;
        }
    }

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
        return this.withLock(userId, async () => {
            let beforeUpdate: UserPoint;
            if (amount < 0) throw new Error('amount should be larger than 0');
            beforeUpdate = await this.userDb.selectById(userId);
            const calcPoint = beforeUpdate.point + amount;
            const afterUpdate = await this.userDb.insertOrUpdate(userId, calcPoint);
            // insertHistory의 결과를 기다리지 않고 넘어감
            this.insertHistory(userId, amount, TransactionType.CHARGE, afterUpdate.updateMillis);
            return afterUpdate;
        });        
    }

    async use(
        userId: number,
        amount: number,
    ): Promise<UserPoint> {
        return this.withLock(userId, async () => {
            let beforeUpdate: UserPoint;
            if (amount < 0) throw new Error('amount should be larger than 0');
            beforeUpdate = await this.userDb.selectById(userId);
            const calcPoint = beforeUpdate.point - amount;
            if (calcPoint < 0) return;  // 잔액 부족 경고 메세지 리턴 필요
            const afterUpdate = await this.userDb.insertOrUpdate(userId, calcPoint);
            // insertHistory의 결과를 기다리지 않고 넘어감
            this.insertHistory(userId, amount, TransactionType.USE, afterUpdate.updateMillis);
            return afterUpdate;
        })
    }

    // history insert를 비동기로 실행
    async insertHistory(
        userId: number,
        amount: number,
        transactionType: TransactionType,
        updateMillis: number
    ): Promise<void> {
        let retries = 3; // 최대 재시도 횟수 (실제 서비스라면 성공할 때 까지 재시도 할 필요 있음)
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
