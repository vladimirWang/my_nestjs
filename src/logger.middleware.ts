import { NestMiddleware, Injectable } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AppService } from "./app.service";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private appService: AppService) {}
  use(req: Request, res: Response, next: NextFunction) {
    console.log("logger middleware--", this.appService.getConfig());
    // console.log("logger middleware--");
    next();
  }
}
