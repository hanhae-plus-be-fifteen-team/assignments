import { Injectable } from '@nestjs/common'
import { SpecialLecturesService } from './special-lectures.service'
import { AdaptationService } from '../adaptation/adaptation.service'

@Injectable()
export class SpecialLecturesServiceAdapter {
  readonly service: SpecialLecturesService

  constructor(private adaptationService: AdaptationService) {
    this.service = this.adaptationService.adapt(SpecialLecturesService)
  }
}
