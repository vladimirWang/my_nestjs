// import { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";

export const User = createParamDecorator((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.user[data] : request.user;
});
