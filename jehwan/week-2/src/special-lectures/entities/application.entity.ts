/**
 * @description
 * [ PG ] entity for the applications
 * N:1 relations with SpecialLectureEntity
 */
export interface ApplicationEntity {
  id: string
  lecture_id: string
  user_id: string
  created_at: Date
}
