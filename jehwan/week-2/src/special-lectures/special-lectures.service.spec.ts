describe('SpecialLecturesService', () => {
  /**
   * (핵심) 특강 신청 API
   */
  describe('Application', () => {
    it.todo('A user should apply for the lecture')
    it.todo('A user should not be able to apply twice or more for the lecture')
    it.todo(
      'A user should not be able to apply if there are already 30 applications',
    )
    /**
     * 동시성 테스트
     */
    it.todo(
      'Applications should be processed sequentially even with concurrent requests',
    )
  })
  /**
   * (기본) 특강 신청 완료 여부 조회 API
   */
  describe('Read the result of the application', () => {
    it.todo('A user should read `applied === true` if the application succeeds')
    it.todo('A user should read `applied === false` if the application fails')
  })
})
