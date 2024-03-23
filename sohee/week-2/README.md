# 특강 신청 서비스(BASIC)
## Requirements
- 아래 2가지 API 를 구현합니다.
    - 특강 신청 API
    - 특강 신청 여부 조회 API

## 요구사항 분석
  - PATCH /enroll/{id}/{class} : class로 수강신청을 시도한다.
  - GET /enroll/{id} : 신청한 class를 모두 조회한다. 
  - 여러명이 동시에 수강신청을 하는 경우에 대한 처리가 필요하다.
      - 수강 신청 시, Service에서 현재 신청한 인원 수를 read한 뒤 return을 줄 때 read하는 부분에서 lock을 건다
      - DB에 저장되는 시점은 현재 신청인원 수와 다를 수 있기 때문에 private count 사용
          - 메모리에 두는 것의 위험성.....
  - 같은 id로 신청하는 것에 대한 구분이 필요하다.
      - 첫번째 신청에 대해 DB에 저장 전인 경우, 같은 id로 또 신청을 하는 것인지 어떻게 확인할지?
  - 수강 신청에 대한 결과는 다음으로 return한다.
    - Success
    - AlreadyEnrolled
    - Closed
  - 요청 결과는 다음으로 return한다.
    - 특강 신청 API 
        - 수강 신청에 대한 결과
        - BadRequest
          - 해당 class의 open기간이 지난 class
          - 존재하지 않는 class
    - 특강 신청 여부 조회 API        
        - 신청한 class 목록



### TBC
     - 특정 시간에 오픈되는 강좌를 어떻게 구현할지?
## ERD
![image](https://github.com/hanhae-plus-be-fifteen-team/assignments/assets/58277594/48d1fba9-74a0-435a-a589-22fa4c7350f8)



