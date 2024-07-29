import {
  ArgumentsHost,
  ExceptionFilter,
  Catch,
  BadRequestException,
  RequestTimeoutException,
  Inject,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch(BadRequestException)
export class CustomExceptionFilter implements ExceptionFilter {
  // constructor(@Inject("PREFIX") private readonly prefix) {}
  catch(exeption: any, host: ArgumentsHost) {
    // console.log(this.prefix, "---prefix");
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exeption.getStatus();
    response.status(status).json({
      statusCode: status,
      message: exeption.getResponse()?.message ?? exeption.getResponse(),
      timestamp: new Date().toLocaleString(),
      path: request.originalUrl,
      method: request.method,
    });
  }
}
