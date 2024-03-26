import { Seeder, SeederFactoryManager } from 'typeorm-extension'
import { DataSource } from 'typeorm'
import { Course } from '../../course/entities/course.entity'

export default class CourseSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const courseRepository = dataSource.getRepository(Course)
    await courseRepository.insert([
      {
        courseId: 1,
        courseName: '선착순 30명 강의',
        openedAt: new Date(2024, 3, 20, 13),
        nmbStudents: 30,
      },
    ])
  }
}
