import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

/**
 * 该过滤器处理类型为 HttpException（及其子类）的异常。
 * 当异常是未识别的（既不是 HttpException 也不是继承自 HttpException 的类），
 * 内置的异常过滤器会生成以下默认的 JSON 响应：
 * {
 *  "statusCode": 500,
 *  "message": "Internal server error"
 * }
 */
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exeption: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse();
    // 如果此响应已经发送给客户端了，就不用处理了
    if (response.headersSent) {
      return;
    }
    if (exeption instanceof HttpException) {
      const msg = exeption.getResponse();
      const status = exeption.getStatus();
      if (typeof msg === "string") {
        response.status(status).json({
          statusCode: status,
          message: msg,
        });
      } else {
        response.status(status).json(msg);
      }
    } else {
      return response.status(500).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: exeption.message,
        message: "Internal server error",
      });
    }
  }
}
