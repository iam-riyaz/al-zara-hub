export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PAYMENT_ERROR"
  | "INSUFFICIENT_INVENTORY"
  | "INVALID_STATE_TRANSITION"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: ErrorCode, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid request payload or parameters", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required or invalid credentials") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "UNAUTHORIZED");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "The requested resource was not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "A resource conflict occurred") {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, 429, "RATE_LIMITED");
  }
}

export class PaymentError extends AppError {
  constructor(message = "Payment processing failed", details?: unknown) {
    super(message, 402, "PAYMENT_ERROR", details);
  }
}

export class InventoryError extends AppError {
  constructor(message = "Item is out of stock or insufficient quantity", details?: unknown) {
    super(message, 409, "INSUFFICIENT_INVENTORY", details);
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(message = "Invalid order state transition", details?: unknown) {
    super(message, 400, "INVALID_STATE_TRANSITION", details);
  }
}
