import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common'
import { EnrollmentService } from './enrollment.service'
import { EnrollResult } from './models/enrollment.result'
import { ClassDto } from './models/enrollment.dto'

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollService: EnrollmentService) {}

  // 수강 신청 시도
  @Patch(':id/enroll')
  async enroll(
    @Param('id') studentId,
    @Body(ValidationPipe) classDto: ClassDto,
  ): Promise<EnrollResult> {
    return await this.enrollService.enroll(studentId, classDto.id)
  }

  // 신청한 class 조회
  @Get(':id')
  async confirm(@Param('id') studentId): Promise<number[]> {
    return await this.enrollService.getClasses(studentId)
  }
}
