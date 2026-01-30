export class ErrorRequest extends Error {
  code: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = "ErrorRequest";
    this.code = code || 400;
    Object.setPrototypeOf(this, ErrorRequest.prototype);
  }
}
