import { EnrollResult } from '../models/enrollment.result'

export interface IEnrollmentRepository {
  enroll(studentId: string, classId: number): Promise<EnrollResult>
  getClasses(studentId: string): Promise<number[]>
}
