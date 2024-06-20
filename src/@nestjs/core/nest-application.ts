import { Logger } from "./logger";
import express, { Express } from "express";

export class NestApplication {
  private readonly app: Express = express();
  constructor(protected readonly module) {}

  //   初始化工作
  async init() {}

  async listen(port: number) {
    await this.init();
    // 调用express实例的listen方法
    this.app.listen(port, () => {
      Logger.log(
        `Application is running on http://localhost:${port}`,
        "NestApplication"
      );
    });
  }
}
