import { Module } from '@nestjs/common'
import { AdaptationService } from '../adaptation/adaptation.service'
import { UsersController } from './users.controller'
import { UsersServiceAdapter } from './users.service.adapter'

@Module({
  controllers: [UsersController],
  providers: [AdaptationService, UsersServiceAdapter],
})
export class UsersModule {}
