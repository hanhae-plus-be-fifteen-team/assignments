import { Module } from '@nestjs/common'
import { SpecialLecturesModule } from './special-lectures/special-lectures.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [SpecialLecturesModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
