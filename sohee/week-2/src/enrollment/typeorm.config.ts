import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'
import { Enrollment } from './models/enrollment.entities'

@Injectable()
export class TypeormConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      password: 'admin',
      username: 'postgres',
      entities: [Enrollment],
      database: 'enrollment',
      synchronize: true,
      logging: true,
    } as TypeOrmModuleOptions
  }
}
