import { IUsersRepository } from './users.repository.interface'
import { CreateUserModel } from './models/create-user.model'
import {
  UserException,
  UserExceptionMessage,
} from './models/user.exception.model'

export class UsersService {
  constructor(private readonly userRepository: IUsersRepository) {}

  /**
   *
   * @param model CreateUserModel
   * @returns A user that created
   */
  createOneUser(model: CreateUserModel) {
    return this.userRepository.withLock(session => {
      return this.userRepository.createOneUser(model, session)
    })
  }

  /**
   *
   * @param id User's id
   * @returns A user that matched
   * @throws Error 'User Not Found' if user not matched
   */
  async readOneUser(id: string) {
    const user = await this.userRepository.readOneUser(id)

    if (!user) {
      throw new UserException(UserExceptionMessage.USER_NOT_FOUND)
    }

    return user
  }
}
