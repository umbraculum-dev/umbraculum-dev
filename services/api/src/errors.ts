export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(statusCode: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends HttpError {
  constructor(code: string, message: string) {
    super(400, code, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(code: string, message: string) {
    super(401, code, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(code: string, message: string) {
    super(403, code, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(code: string, message: string) {
    super(404, code, message);
  }
}

export class PaymentRequiredError extends HttpError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(402, code, message, details);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(429, code, message, details);
  }
}

