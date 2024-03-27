/**
 * @description
 * [step-4 Domain Model] SpecialLecture
 */
export interface SpecialLecture {
  /**
   * @description UUID
   */
  id: string
  /**
   * @description title for the lecture
   */
  title: string
  /**
   * @description application deadline
   */
  openingDate: Date
}

export interface SpecialLectureCount {
  /**
   * UUID
   */
  id: string
  /**
   * @description reference for the lecture
   */
  lectureId: string
  /**
   * @description associated lecture when a lookup is requested
   */
  lecture?: SpecialLecture
  /**
   * @description maximum count for the lecture
   */
  maximum: number
  /**
   * @description
   * current count for the lecture
   * count should be less than or equal to maximum
   */
  count: number
}
