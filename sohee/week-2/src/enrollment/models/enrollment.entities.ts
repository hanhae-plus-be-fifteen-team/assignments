import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  total: number

  @Column()
  students: string[]
}

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  classId: number

  @Column()
  studentId: string
}
