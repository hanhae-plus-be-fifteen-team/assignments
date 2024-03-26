import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Class {
  @PrimaryGeneratedColumn()
  id: number
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
