# [ 1주차 과제 ] TDD 로 개발하기

## 아키텍처 구성

![arch](assets/arch.jpg)

## 새로 작성한 코드

- src/point/point.service.ts (포인트 도메인 로직)
- src/point/point.service.spec.ts (포인트 도메인 로직 유닛 테스트)
- src/point/point.controller.spec.ts (포인트 컨트롤러 유닛 테스트)
- test/app.e2e-spec.ts (API 호출 및 동시성 테스트)

## 트러블 슈팅

```ts
const requests = await Promise.all(
  Array.from({length: 10}, (_, i) => {
    return request(app.getHttpServer()).patch('/point/1/charge').send({
      amount: 10000,
    })
  }),
)
```

### 증상

병렬로 요청을 보내면, 기대 합이 다른 문제가 발생

### 원인 분석

요청이 여러번 들어왔을 때, 데이터를 읽고 쓰는 시점에 동기화 문제가 발생함.

```ts
// 읽는 시점
const userPointBeforeUpsert = await this.userPointTable.selectById(userId)

// 쓰는 시점
const userPointAfterUpsert = await this.userPointTable.insertOrUpdate(
  userId,
  userPointBeforeUpsert.point + amount,
)
```

![concurrency](assets/concurrency.png)

### 해결 방법

lock 을 이용한 쓰기 권한 관리

```ts
class PointService {
  private writeLock: boolean = false

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
```

setTimeout 을 이용하여, 싱글 스레드 환경에서 busy waiting 을 구현함

```
async charge() {
  await this.waitWriteLock()
  this.writeLock = true
  // ...
  this.writeLock = false
}
```

![concurrency-2](assets/concurrency-2.png)

위와 같이 사용하여, 동시에 하나의 작업만 쓰기 작업을 수행할 수 있도록 제한함
