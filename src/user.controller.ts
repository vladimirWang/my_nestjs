import { Controller, Get, Request, Req } from "@nestjs/common";
import { Request as ExpressRequest } from "express";

@Controller("users")
export class UserController {
  @Get("req")
  handleRequest(
    @Req() req: ExpressRequest,
    @Request() request: ExpressRequest
  ) {
    return "user get";
  }
}
