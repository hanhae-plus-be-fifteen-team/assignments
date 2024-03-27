/**
 * @description
 * [ PG ] entity for the applications
 * N:1 relations with SpecialLectureEntity
 */
export interface ApplicationEntity {
  lecture_id: number
  user_id: number
  created_at: Date
}
