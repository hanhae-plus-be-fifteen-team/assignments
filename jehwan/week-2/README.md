# Architecture 설계

![architecture](./assets/architecture.jpg)

## 설명

`SpecialLecturesService`(비즈니스 로직)는 TypeScript로만 완성되어 있으며, Nest에 대한 의존성이 없어 다양한 프레임워크에서 활용 가능합니다. 이번 과제를 Nest.js로 진행하기
위해, TypeScript 구현체를 Nest의 서비스로 통합하는 `SpecialLecturesServiceAdapter`를 구현했습니다. 이를 통해 비즈니스 로직이 Nest 애플리케이션을 의존하는 것이 아니라,
Nest 애플리케이션이 비즈니스
로직에 의존하도록 구성했습니다.

Persistence 를 위해 `RepositoryInterface`를 작성했습니다. 비즈니스 로직은 `RepositoryInterface`를 참조하며, 실제 구현체
또한 `RepositoryInterface`를 기반으로 합니다. 이 구조를 통해 사용되는 DB 드라이버와 상관없이 `RepositoryImpl`(구현체)을 통해 DB 드라이버와 비즈니스 로직 간의 커뮤니케이션이
가능합니다.

# 도메인 설명

## 핵심 용어

- `specialLecture`: 특강
    - `application`: 신청 (특강의 하위 항목)
    - `count`: 신청 수 (특강의 하위 항목)
- `user`: 사용자

## 핵심 구조

### 디렉토리

- `[도메인]/*`: 해당 도메인과 관련된 디렉토리
- `[도메인]/models/`: 도메인 모델 정의
- `[도메인]/entities/`: DB 에 종속된 엔티티 정의
- `[도메인]/mocks/`: 테스트 모킹 함수 (유닛테스트)
- `[도메인]/dto/`: 클라이언트와 컨트롤러간 DTO

### 레이어

#### Business Layer

- `[도메인]/[도메인].service.ts`: 도메인 비지니스 로직 (Nest 에 종속적이 않은 형태로 작성)
- `[도메인]/[도메인].service.spec.ts`: 도메인 비지니스 로직 유닛테스트 (Nest 에 종속적이 않은 형태로 작성)
- `[도메인]/[도메인].repository.interface.ts`: 도메인 레포지토리 인터페이스 (Nest 에 종속적이 않은 형태로 작성)

#### Persistence Layer

- `[도메인]/[도메인].repository.impl.ts`: 레포지토리 구현체 (Nest 에 종속적이 않은 형태로 작성)

#### Nest Application Layer (Presentation)

- `[도메인]/[도메인].controller.ts`: Nest 컨트롤러
- `[도메인]/[도메인].service.adapter.ts`: Nest 서비스 어댑터 (Adapter -> Service)

# ERD

![ERD](./assets/ERD.png)

# E2E test

- (핵심) 특강 신청 API
    - [x] 동일한 신청자는 한 번의 수강 신청만 성공할 수
      있습니다. [링크](https://github.com/hanhae-plus-be-fifteen-team/assignments/blob/578ef9c2208994468a53dbfc99e56d6cb36efa40/jehwan/week-2/test/app.e2e-spec.ts#L103)
    - [x] 이미 신청자가 30명이 초과되면 이후 신청자는 요청을
      실패합니다. [링크](https://github.com/hanhae-plus-be-fifteen-team/assignments/blob/578ef9c2208994468a53dbfc99e56d6cb36efa40/jehwan/week-2/test/app.e2e-spec.ts#L118)
    - [x] 신청 일자 이전에는 요청이
      실패합니다. [링크](https://github.com/hanhae-plus-be-fifteen-team/assignments/blob/578ef9c2208994468a53dbfc99e56d6cb36efa40/jehwan/week-2/test/app.e2e-spec.ts#L140)
- (기본) 특강 신청 여부 조회 API
    - [x] 특강 신청에 성공한 사용자는
      성공했음을 [링크](https://github.com/hanhae-plus-be-fifteen-team/assignments/blob/578ef9c2208994468a53dbfc99e56d6cb36efa40/jehwan/week-2/test/app.e2e-spec.ts#L183)
    - [x] 특강 등록자 명단에 없는 사용자는
      실패 [링크](https://github.com/hanhae-plus-be-fifteen-team/assignments/blob/578ef9c2208994468a53dbfc99e56d6cb36efa40/jehwan/week-2/test/app.e2e-spec.ts#L193)
- (선택) 특강 선택 API
    - [x] 단 한번의 특강을 위한 것이 아닌 날짜별로 특강이 존재할 수 있는 범용적인 서비스로 변화시켜
      봅니다. [링크](https://github.com/hanhae-plus-be-fifteen-team/assignments/blob/578ef9c2208994468a53dbfc99e56d6cb36efa40/jehwan/week-2/test/app.e2e-spec.ts#L208)

# 서버 실행

### Postgres (Docker Compose)

```sh
docker compose up --build -d
```

### Nest Application

```sh
DB_USER=user DB_PASSWORD=password DB_NAME=test pnpm start
```
