export interface SpecialLecturesModel {
  /**
   * @description applicants for the lecture
   */
  applicants: Set<number>
}

export interface SpecialLectureApplicationResult {
  /**
   * @description an applicant's id for the lecture
   */
  userId: number
  /**
   * @description an applicant's applied result for the lecture
   */
  applied: boolean
}
