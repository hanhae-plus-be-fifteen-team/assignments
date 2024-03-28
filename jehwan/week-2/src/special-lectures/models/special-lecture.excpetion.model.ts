export enum SpecialLectureExceptionMessage {
  'LIMIT_EXCEEDED' = 'Limit Exceeded',
  'ALREADY_APPLIED' = 'Already Applied',
  'LECTURE_DOES_NOT_EXIST' = 'Lecture Does Not Exist',
  'NOT_OPEN_YET' = 'Not Open Yet',
}

export class SpecialLectureException extends Error {
  name = 'SpecialLectureException'

  constructor(message: SpecialLectureExceptionMessage) {
    super(message)
  }
}
