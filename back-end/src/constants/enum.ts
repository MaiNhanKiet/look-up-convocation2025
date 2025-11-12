export enum TokenType {
  AccessToken,
  RefreshToken
}

export enum ErrorName {
  ValidationError = 'VALIDATION_ERROR',
  Unauthenticated = 'UNAUTHENTICATED',
  ForbiddenError = 'FORBIDDEN_ERROR',
  NotFoundError = 'NOT_FOUND_ERROR',
  ConflictError = 'CONFLICT_ERROR',
  InternalServerError = 'INTERNAL_SERVER_ERROR'
}

export enum ActionLog {
  Server = 'SERVER',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
  Unknown = 'UNKNOWN'
}

export enum ResourceLog {
  User = 'USER',
  Employee = 'EMPLOYEE',
  Vote = 'VOTE',
  Rating = 'RATING',
  Authentication = 'AUTHENTICATION',
  System = 'SYSTEM'
}

export enum AuditStatusLog {
  Success = 'SUCCESS',
  Failure = 'FAILURE'
}
