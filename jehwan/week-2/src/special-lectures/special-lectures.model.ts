/**
 * @deprecated it's step 3 domain model!!!!!
 */
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

/**
 * @description [step-4 Domain Model] SpecialLecture
 */
export interface SpecialLecture {
  /**
   * @description id for the lecture
   */
  id: number
  /**
   * title for the lecture
   */
  title: string
}

/**
 * @description [step-4 Domain Model] Application
 */
export interface Application {
  /**
   * @description reference for the lecture
   */
  lectureId: number
  /**
   * @description associated lecture when a lookup is requested
   */
  lecture?: SpecialLecture
  /**
   * @description applied result for the lecture
   */
  applied: boolean
  /**
   * @description reference for the user
   */
  userId: number
  /**
   * @description
   * registration timestamp for the lecture
   * not applied if null
   */
  timestamp: Date | null
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
