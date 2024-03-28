export enum UserExceptionMessage {
  'USER_NOT_FOUND' = 'User Not Found',
}

export class UserException extends Error {
  name = 'UserException'

  constructor(message: UserExceptionMessage) {
    super(message)
  }
}
