import { UserModel } from './models/user.model'
import { CreateUserModel } from './models/create-user.model'

export interface IUsersRepository {
  /**
   *
   * @param model CreateUserModel
   * @returns A user that created
   */
  createOneUser(model: CreateUserModel): Promise<UserModel>

  /**
   *
   * @param id user's id
   * @returns A user that matched
   */
  readOneUser(id: string): Promise<UserModel | null>
}
