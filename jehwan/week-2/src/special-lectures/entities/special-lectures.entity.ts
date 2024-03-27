/**
 * @description
 * [ PG ] entity for the special_lectures table
 */
export interface SpecialLectureEntity {
  id: number
  title: string
  created_at: Date
}

/**
 * @description
 * [ PG ] entity for the special_lecture_counts table
 * 1:1 relations with SpecialLectureEntity
 */
export interface SpecialLectureCountEntity {
  lecture_id: number
  maximum: number
  count: number
}
