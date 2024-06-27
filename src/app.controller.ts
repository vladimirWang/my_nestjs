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
} from "@nestjs/common";
import { Response as ExpressResponse } from "express";
import { User } from "./user.decorator";

@Controller()
export class AppController {
  @Get()
  index() {
    return "hell3o";
  }

  @Get("info")
  info() {
    return "info";
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
  @Get("session")
  session(@Session() session: any, @Session("pageView") pageView: any) {
    console.log("session: ", session);
    console.log("pageView: ", pageView);
    if (session.pageView) {
      session.pageView++;
    } else {
      session.pageView = 1;
    }
    return `pageView: ${session.pageView}`;
  }

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
