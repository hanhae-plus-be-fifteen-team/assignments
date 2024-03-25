import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { SpecialLecturesService } from './special-lectures.service'
import { AdaptationService } from '../adaptation/adaptation.service'
import { SpecialLecturesRepositoryImpl } from './special-lectures.repository.impl'
import { SpecialLecturesRepository } from './special-lectures.repository'

@Injectable()
export class SpecialLecturesServiceAdapter implements OnModuleDestroy {
  readonly service: SpecialLecturesService
  private readonly repository: SpecialLecturesRepository

  constructor(private adaptationService: AdaptationService) {
    this.repository = new SpecialLecturesRepositoryImpl()
    this.service = this.adaptationService.adapt(SpecialLecturesService, [
      this.repository,
    ])
  }

  async onModuleDestroy() {
    await this.repository.close()
  }
}
