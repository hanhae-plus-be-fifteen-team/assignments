import { EnrollResult } from '../enrollment.model'

export interface IEnrollmentRepository {
  enroll(studentId: string, classId: number): Promise<EnrollResult>
  getClasses(studentId: string): Promise<number[]>
}
