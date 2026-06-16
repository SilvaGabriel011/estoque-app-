/**
 * Error type for business-rule / validation failures in the service layer.
 * API route handlers translate these into HTTP responses with `status`.
 */
export class DomainError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "DomainError";
    this.status = status;
  }
}

export class NotFoundError extends DomainError {
  constructor(message = "Not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
