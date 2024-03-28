import { Module } from '@nestjs/common'
import { AdaptationService } from '../adaptation/adaptation.service'
import { SpecialLecturesServiceAdapter } from './special-lectures.service.adapter'
import { SpecialLecturesController } from './special-lectures.controller'

@Module({
  controllers: [SpecialLecturesController],
  providers: [AdaptationService, SpecialLecturesServiceAdapter],
})
export class SpecialLecturesModule {}
