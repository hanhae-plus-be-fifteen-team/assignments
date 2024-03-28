export interface UserEntity {
  /**
   * @description UUID
   */
  id: string

  /**
   * @description username
   */
  username: string

  /**
   * @description timestamp that user created
   */
  created_at: Date
}
