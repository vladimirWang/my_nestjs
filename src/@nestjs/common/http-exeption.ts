import { HttpStatus } from "./http-status.enum";

export class HttpException extends Error {
  private readonly response: string | object;
  private readonly status: HttpStatus;
  constructor(response: string | object, status: HttpStatus) {
    super();
    this.response = response;
    this.status = status;
  }

  getResponse() {
    return this.response;
  }
  getStatus() {
    return this.status;
  }
}
