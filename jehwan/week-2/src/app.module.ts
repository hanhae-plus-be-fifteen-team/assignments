import { Module } from '@nestjs/common'
import { SpecialLecturesModule } from './special-lectures/special-lectures.module'

@Module({
  imports: [SpecialLecturesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
