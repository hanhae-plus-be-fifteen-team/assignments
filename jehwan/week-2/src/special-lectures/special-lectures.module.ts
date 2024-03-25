import { Module } from '@nestjs/common'
import { AdaptationService } from '../adaptation/adaptation.service'
import { SpecialLecturesServiceAdapter } from './special-lectures.service.adapter'

@Module({
  providers: [AdaptationService, SpecialLecturesServiceAdapter],
})
export class SpecialLecturesModule {}
