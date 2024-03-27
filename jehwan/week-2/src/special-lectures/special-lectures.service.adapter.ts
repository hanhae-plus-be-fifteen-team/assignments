import { Injectable } from '@nestjs/common'
import { SpecialLecturesService } from './special-lectures.service'
import { AdaptationService } from '../adaptation/adaptation.service'
import { SpecialLecturesRepositoryImpl } from './special-lectures.repository.impl'

@Injectable()
export class SpecialLecturesServiceAdapter {
  /**
   * @todo
   * Don't use SpecialLecturesService directly,
   * declare the interface of SpecialLecturesService
   */
  readonly service: SpecialLecturesService

  constructor(private adaptationService: AdaptationService) {
    /**
     * @description
     * Integrate SpecialLecturesService written purely in TypeScript into the Nest application.
     */
    this.service = this.adaptationService.adapt(SpecialLecturesService, [
      SpecialLecturesRepositoryImpl,
    ])
  }
}
