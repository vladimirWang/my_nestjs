import {
  Redirect,
  Get,
  Post,
  Controller,
  Query,
  Headers,
  Session,
  Ip,
  Param,
  Body,
  Response,
  Next,
  HttpCode,
  Header,
  Inject,
  HttpException,
  HttpStatus,
  BadRequestException,
  UseFilters,
  RequestTimeoutException,
} from "@nestjs/common";
import { Response as ExpressResponse } from "express";
import { User } from "./user.decorator";
import {
  LoggerClassSerive,
  LoggerService,
  UseFactory,
  UseValueService,
} from "./logger.service";
import { OtherService } from "./other.service";
import { AppService } from "./app.service";
import { ForbiddenException } from "./forbidden.exception";
import { CustomExceptionFilter } from "./custom-exception.filter";

// @Inject()
@Controller("app2")
export class App2Controller {
  constructor(private appService: AppService) {}

  @Get()
  index() {
    console.log("app2");
    return "app2";
  }
}
