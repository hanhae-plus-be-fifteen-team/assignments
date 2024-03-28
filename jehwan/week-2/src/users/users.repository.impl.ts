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

  withLock<T>(atom: (session?: unknown) => Promise<T>): Promise<T> {
    return this.pg.tx<T>(() => atom())
  }

  async createOneUser(
    model: CreateUserModel,
    session?: pgPromise.ITask<unknown>,
  ): Promise<UserModel> {
    const conn = session ?? this.pg

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
