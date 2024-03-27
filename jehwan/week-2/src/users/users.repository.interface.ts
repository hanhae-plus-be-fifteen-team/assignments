import { UserModel } from './models/user.model'
import { CreateUserModel } from './models/create-user.model'

export interface IUsersRepository {
  /**
   *
   * @param model CreateUserModel
   * @param session Session for Transaction
   * @returns A user that created
   */
  createOneUser(model: CreateUserModel, session?: unknown): Promise<UserModel>

  /**
   *
   * @param id user's id
   * @returns A user that matched
   */
  readOneUser(id: string): Promise<UserModel | null>

  /**
   *
   * @param atom A function that guarantees atomicity
   */
  withLock<T>(atom: (session?: unknown) => Promise<T>): Promise<T>
}
