import { SpecialLecture } from './special-lectures.model'

/**
 * @description
 * [step-4 Domain Model] Application
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
