import {
  ArgumentsHost,
  ExceptionFilter,
  Catch,
  BadRequestException,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch(BadRequestException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exeption: any, host: ArgumentsHost) {
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
