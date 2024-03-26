import { Module } from '@nestjs/common'
import { EnrollmentModule } from './enrollment/enrollment.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TypeormConfig } from './enrollment/typeorm.config'
import { DataSource, DataSourceOptions } from 'typeorm'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeormConfig,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize()
      },
    }),
    EnrollmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
