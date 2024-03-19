import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PointModule } from './point/point.module'
import { UserPointService } from './userpoint/userpoint.service'

@Module({
  imports: [PointModule],
  controllers: [AppController],
  providers: [AppService, UserPointService],
})
export class AppModule {}
