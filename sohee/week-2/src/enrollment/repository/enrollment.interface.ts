import { EnrollResult } from '../models/enrollment.result'

export const IENROLLMENT_REPOSITORY = 'Enrollment Repository'
export interface IEnrollmentRepository {
  enroll(studentId: string, classId: number): Promise<EnrollResult>
  getClasses(studentId: string): Promise<number[]>
}
