/**
 * @description
 * [ PG ] entity for the special_lectures table
 */
export interface SpecialLectureEntity {
  id: string
  title: string
  opening_date: Date
}

/**
 * @description
 * [ PG ] entity for the special_lecture_counts table
 * 1:1 relations with SpecialLectureEntity
 */
export interface SpecialLectureCountEntity {
  id: string
  lecture_id: string
  maximum: number
  count: number
}
