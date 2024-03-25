import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import { PointHistory, UserPoint } from './point.model'
import { PointBody as PointDto } from './point.dto'

// 아래 코드를 변경하고 테스트를 돌려주세요.
// case 1. 본 구현 point.service.ts
// case 2. 대조군 (직접 락 구현) point.service.others.ts
// case 3. 대조군 (async mutex) point.service.mutex.ts
import { PointService } from './point.service.mutex'

@Controller('/point')
export class PointController {
  constructor(private pointService: PointService) {}

  @Get('footprints')
  async footprints() {
    return this.pointService.footprints()
  }

  /**
   * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
   */
  @Get(':id')
  async point(@Param('id') id: string): Promise<UserPoint> {
    const userId = Number.parseInt(id)

    return this.pointService.readPoint(userId)
  }

  /**
   * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
   */
  @Get(':id/histories')
  async history(@Param('id') id: string): Promise<PointHistory[]> {
    const userId = Number.parseInt(id)

    return this.pointService.readHistories(userId)
  }

  /**
   * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   */
  @Patch(':id/charge')
  async charge(
    @Param('id') id: string,
    @Body(ValidationPipe) pointDto: PointDto,
    @Query('label') label?: string,
  ): Promise<UserPoint> {
    const userId = Number.parseInt(id)
    const amount = pointDto.amount

    return this.pointService.charge(userId, amount, label)
  }

  /**
   * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
   */
  @Patch(':id/use')
  async use(
    @Param('id') id: string,
    @Body(ValidationPipe) pointDto: PointDto,
    @Query('label') label?: string,
  ): Promise<UserPoint> {
    const userId = Number.parseInt(id)
    const amount = pointDto.amount

    try {
      return await this.pointService.use(userId, amount, label)
    } catch (e) {
      if (e.message === 'Limit Exceeded') {
        throw new BadRequestException(e.message, { cause: e })
      }
      throw new InternalServerErrorException(e.message, { cause: e })
    }
  }
}
