import { IUsersRepository } from './users.repository.interface'
import { CreateUserModel } from './models/create-user.model'

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
   */
  async readOneUser(id: string) {
    const user = await this.userRepository.readOneUser(id)

    if (!user) {
      throw Error('User Not Found')
    }

    return user
  }
}
