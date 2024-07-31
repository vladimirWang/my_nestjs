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
  ParseBoolPipe,
  ParseArrayPipe,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseEnumPipe,
  DefaultValuePipe,
  UsePipes,
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
import { CustomPipe } from "./custom.pipe";
import { ZodValidationPipe } from "./zod-validation.pipe";
import { createCatSchema, CreateCatDto } from "./create-cat.dto";

enum Roles {
  Admin = "Admin",
  Vip = "Vip",
}

// @Inject()
@Controller("app")
@UsePipes(new ZodValidationPipe(createCatSchema))
export class AppController {
  constructor(private appService: AppService) {}
  // constructor(
  //   private ottherService: OtherService,
  //   private loggerService: LoggerService,
  //   private loggerClassSerive: LoggerClassSerive,
  //   @Inject("FactoryToken") private useFactory: UseFactory,
  //   @Inject("StringToken") private useValueService: UseValueService
  // ) {}

  @Post("zod-validation")
  @UsePipes(new ZodValidationPipe(createCatSchema))
  zodValidationPipe(@Body() createCatDto: CreateCatDto) {
    console.log("createCatDto: ", createCatDto);
    return "this action add a new cat";
  }

  @Get("custom-pipe/:value")
  getCustomPipe(@Param("value", CustomPipe) value: any, age: number) {
    return "custom-pipe value: " + value;
  }

  @Get("default")
  getUsername(
    @Query("username", new DefaultValuePipe("guest")) username: string[]
  ) {
    return "username: " + username;
  }

  @Get("admin/:role")
  getRole(@Param("role", new ParseEnumPipe(Roles)) role: string[]) {
    console.log(
      Object.prototype.toString.call(role),
      "; ",
      role,
      "---typeof id"
    );
    return "app: " + role;
  }

  // 测试用的uuid
  // 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
  @Get("uuid/:value")
  getUuid(@Param("value", ParseUUIDPipe) value: string[]) {
    console.log(
      Object.prototype.toString.call(value),
      "; ",
      value,
      "---typeof id"
    );
    return "app: " + value;
  }

  @Get("array/:value")
  getArray(@Param("value", ParseArrayPipe) value: string[]) {
    console.log(
      Object.prototype.toString.call(value),
      "; ",
      value,
      "---typeof id"
    );
    return "app: " + value;
  }

  @Get("array2/:value")
  getArray2(
    @Param("value", new ParseArrayPipe({ items: String, separator: "@" }))
    value: string[]
  ) {
    console.log(
      Object.prototype.toString.call(value),
      "; ",
      value,
      "---typeof id"
    );
    return "app: " + value;
  }

  @Get("bool/:value")
  getBool(@Param("value", ParseBoolPipe) value: string) {
    console.log(typeof value, "; ", value, "---typeof id");
    return "app: " + value;
  }

  @Get("number/:id")
  index(@Param("id", ParseIntPipe) id: number) {
    console.log(typeof id, "; ", id, "---typeof id");
    return "app: " + id;
  }

  @Get("other")
  common() {
    console.log("other");
    return this.appService.getConfig();
  }
  @Get("exception")
  exception() {
    // 当异常是未识别的（既不是HttpException，也不是继承自HttpException的类）
    // {"statusCode": 500, "message": "Internal server error"}
    // throw new Error("未识别");
    // throw new HttpException("Forbiden", HttpStatus.FORBIDDEN);
    throw new HttpException(
      {
        errorCode: "E00001",
        status: HttpStatus.FORBIDDEN,
        error: "这是一个自定义的错误消息",
      },
      HttpStatus.FORBIDDEN
    );
  }
  @Get("custom")
  custom() {
    // 当异常是未识别的（既不是HttpException，也不是继承自HttpException的类）
    // {"statusCode": 500, "message": "Internal server error"}
    // throw new Error("未识别");
    // throw new HttpException("Forbiden", HttpStatus.FORBIDDEN);
    throw new ForbiddenException();
  }
  @Get("badrequest")
  @UseFilters(new CustomExceptionFilter())
  badRequest() {
    // 当异常是未识别的（既不是HttpException，也不是继承自HttpException的类）
    // {"statusCode": 500, "message": "Internal server error"}
    throw new Error("未识别");
    // throw new HttpException("Forbiden", HttpStatus.FORBIDDEN);
    // throw new BadRequestException("something bad happened", "some error occur");
    // throw new RequestTimeoutException("timeout", "timeout2");
  }

  @Get("ab*de")
  abcde() {
    return "abcde";
  }
  @Get("info")
  info() {
    return "info";
  }
  @Get("config")
  config() {
    // return this.appService.getConfig();
    return "hello middleware";
  }
  @Get("config/a")
  configA() {
    // return this.appService.getConfig();
    return "hello middleware aaa";
  }
  @Get("query")
  query(@Query("id") id: any) {
    return id ? id : "id doesn't existed";
  }

  @Get("headers")
  headers(@Headers() headers: any, @Headers("accept-encoding") accept: string) {
    console.log("headers: ", headers);
    console.log("accept: ", accept);
    return `accept: ${accept}`;
  }
  // @Get("session")
  // session(@Session() session: any, @Session("pageView") pageView: any) {
  //   console.log("session: ", session);
  //   console.log("pageView: ", pageView);
  //   if (session.pageView) {
  //     session.pageView++;
  //   } else {
  //     session.pageView = 1;
  //   }
  //   return `pageView: ${session.pageView}`;
  // }

  @Get("ip")
  ip(@Ip() ip: string) {
    return ip;
  }

  @Get(":username/info/:age")
  getUserDetail(
    @Param() params: any,
    @Param("username") username: string,
    @Param("age") age: number
  ) {
    console.log("params: ", params);
    console.log("username: ", username);
    console.log("age: ", age);
    return `${username}\'s age is ${age}`;
  }

  @Get("star/ab*de")
  wildCard() {
    return `wildCard result`;
  }

  @Post("create")
  createUser(@Body() body: any, @Body("username") username: string) {
    return "user created: " + JSON.stringify(body) + "; username: " + username;
  }

  @Post("create2")
  createUser2(
    @Response() res: ExpressResponse,
    @Body("username") username: string
  ) {
    res.send("ok");
  }
  @Post("create3")
  // @HttpCode(200)
  @Header("name", "mike")
  @Header("age", "12")
  createUser3(@Body("username") username: string) {
    return `username: ${username}`;
  }

  @Get("passthrough")
  passthrough(@Response({ passthrough: true }) res: ExpressResponse) {
    res.setHeader("key", "value");
    return "pass through";
  }

  @Get("next")
  middleware(@Next() next) {
    // return "next";
    next();
  }

  @Get("redirect")
  @Redirect("/passthrough", 301)
  handleRedirect() {}

  @Get("redirect2")
  handleRedirect2(@Query("version") version: string) {
    return {
      url: `http://docs.nestjs.com/v${version}`,
      statusCode: 302,
    };
  }

  @Get("customParamDecorator")
  customParamDecorator(@User() user: any, @User("age") age: number) {
    return `${JSON.stringify(user)} \'s age is ${age}`;
  }
}
