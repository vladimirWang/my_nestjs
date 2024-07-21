import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exeption: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse();
    if (exeption instanceof HttpException) {
      if (typeof exeption.getResponse() === "string") {
        // const response: any = exeption.getResponse();
        const status: any = exeption.getStatus();
        response.status(status).json({
          statusCode: status,
          message: exeption.getResponse(),
        });
      } else {
        response.status(exeption.getStatus()).json(exeption.getResponse());
      }
    } else {
      return response.status(500).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      });
    }
  }
}
