import { CreateUserModel } from './models/create-user.model'
import { UserModel } from './models/user.model'
import { IUsersRepository } from './users.repository.interface'
import pgPromise from 'pg-promise'
import { createDb } from '../database'
import { UserEntity } from './entities/user.entity'

export class UsersRepositoryImpl implements IUsersRepository {
  private readonly pg: pgPromise.IDatabase<unknown>

  constructor() {
    this.pg = createDb()
  }

  async createOneUser(model: CreateUserModel): Promise<UserModel> {
    await this.pg.none('INSERT INTO users (username) values ($1)', [
      model.username,
    ])

    const userEntity = await this.pg.one<UserEntity>(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT 1',
    )

    return {
      id: userEntity.id,
      username: userEntity.username,
      createdAt: userEntity.created_at,
    }
  }

  async readOneUser(id: string): Promise<UserModel | null> {
    const userEntity = await this.pg.oneOrNone<UserEntity>(
      'SELECT * FROM users LIMIT 1',
    )

    if (!userEntity) {
      return null
    }

    return {
      id: userEntity.id,
      username: userEntity.username,
      createdAt: userEntity.created_at,
    }
  }
}
