/**
 * 본 테스트에서는 controller 에 adapter 패턴이 잘 정의되는지를 검사합니다.
 */

import { Test, TestingModule } from '@nestjs/testing'
import { SpecialLecturesController } from './special-lectures.controller'
import { SpecialLecturesServiceAdapter } from './special-lectures.service.adapter'
import { AdaptationService } from '../adaptation/adaptation.service'
import { SpecialLecturesService } from './special-lectures.service'

describe('PointController', () => {
  let controller: SpecialLecturesController
  let adapter: SpecialLecturesServiceAdapter

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SpecialLecturesController],
      providers: [
        SpecialLecturesServiceAdapter,
        AdaptationService,
        {
          /**
           * SpecialLectureService 가 SpecialLecturesServiceAdapter 에 주입되어야 합니다.
           */
          provide: SpecialLecturesService,
          useValue: jest.fn(),
        },
      ],
    }).compile()

    controller = app.get<SpecialLecturesController>(SpecialLecturesController)
    adapter = app.get<SpecialLecturesServiceAdapter>(
      SpecialLecturesServiceAdapter,
    )
  })

  it('should be defined & should adapt SpecialLecturesService', () => {
    expect(controller).toBeDefined()
    expect(adapter.service).toBeInstanceOf(SpecialLecturesService)
  })
})
