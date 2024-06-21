import { Get, Controller } from "@nestjs/common";

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
}
