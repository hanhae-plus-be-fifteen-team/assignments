export interface CreateSpecialLecturesModel {
  /**
   * @description title for the lecture
   */
  title: string
  /**
   * @description application deadline
   */
  openingDate: Date
  /**
   * @description maximum count for the lecture
   */
  maximum: number
}
