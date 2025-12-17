export class DomainError extends Error {
  constructor(public code: string, message: string, public status: number = 400) {
    super(message);
  }
}
