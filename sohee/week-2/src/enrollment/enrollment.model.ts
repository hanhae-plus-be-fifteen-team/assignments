export type Enrollment = {
  studentId: string
  classId: number
}

export enum EnrollResult {
  Success = 'Success',
  AlreadyEnrolled = 'Already Enrolled',
  Closed = 'Closed',
}
