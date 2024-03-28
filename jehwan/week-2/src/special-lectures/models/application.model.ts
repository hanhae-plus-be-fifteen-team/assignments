import { SpecialLecture } from './special-lecture.model'

/**
 * @description
 * [step-4 Domain Model] Application
 */
export interface Application {
  /**
   * @description UUID
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
   * @description applied result for the lecture
   */
  applied: boolean
  /**
   * @description reference for the user
   */
  userId: string
  /**
   * @description
   * registration timestamp for the lecture
   * not applied if null
   */
  timestamp: Date | null
}
