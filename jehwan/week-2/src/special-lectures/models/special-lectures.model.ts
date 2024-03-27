/**
 * @description
 * [step-4 Domain Model] SpecialLecture
 */
export interface SpecialLecture {
  /**
   * @description id for the lecture
   */
  id: number
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
   * @description reference for the lecture
   */
  lectureId: number
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
