import { Module } from '@nestjs/common'
import { CourseModule } from './course/course.module'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'hanghaeplus',
      entities: [__dirname + '/**/*.entry{.ts,.js}'],
      synchronize: true,
    }),
    CourseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}