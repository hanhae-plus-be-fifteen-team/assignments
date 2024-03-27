import { Injectable } from '@nestjs/common'
import { AdaptationService } from '../adaptation/adaptation.service'
import { UsersService } from './users.service'
import { UsersRepositoryImpl } from './users.repository.impl'

@Injectable()
export class UsersServiceAdapter {
  readonly service: UsersService

  constructor(private adaptationService: AdaptationService) {
    /**
     * @description
     * Integrate UserService written purely in TypeScript into the Nest application.
     */
    this.service = this.adaptationService.adapt(UsersService, [
      UsersRepositoryImpl,
    ])
  }
}
