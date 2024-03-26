import { Module } from '@nestjs/common'
import { CourseService } from './course.service'
import { CourseController } from './course.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Course } from './entities/course.entity'
import { CourseRegHistory } from './entities/course.reg.history.entity'
import { CourseRepositoryImpl } from './course.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseRegHistory])],
  controllers: [CourseController],
  providers: [CourseService, CourseRepositoryImpl],
  exports: [],
})
export class CourseModule {}
