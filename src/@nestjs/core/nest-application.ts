import "reflect-metadata";
import { Logger } from "./logger";
import express, {
  Express,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { Controller } from "../common";
import path from "path";

export class NestApplication {
  private readonly app: Express = express();
  constructor(protected readonly module) {}

  //   初始化工作
  async init() {
    // 取出模块里所有的控制器，然后做好路由配置
    const controllers = Reflect.getMetadata("controllers", this.module) || [];
    Logger.log(`AppModule dependencies initialized`, "InstanceLoader");

    // 路由映射的核心是知道，什么养的请求方法什么的路径对应的哪个处理函数
    for (const Controller of controllers) {
      // 获取每个控制器实例
      const controller = new Controller();
      // 获取控制器的前缀
      const prefix = Reflect.getMetadata("prefix", Controller) || "/";
      Logger.log(`${Controller.name} {${prefix}}`, "RoutesResolver");
      // 开始解析路由
      // 等同于Controller.prototype
      const controllerPrototype = Reflect.getPrototypeOf(controller);

      for (const methodName of Object.getOwnPropertyNames(
        controllerPrototype
      )) {
        // 遍历原型上的方法
        const method = controllerPrototype[methodName];
        const httpMethod = Reflect.getMetadata("method", method);
        const pathMetadata = Reflect.getMetadata("path", method);
        if (!httpMethod) continue;

        const routePath = path.posix.join("/", prefix, pathMetadata);
        this.app[httpMethod.toLowerCase()](
          routePath,
          (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
            const result = method.call(controller);
            res.send(result);
            Logger.log(
              `Mapped {${routePath}, ${method}} route`,
              "RoutesResolver"
            );
          }
        );
      }
      Logger.log("Nest application successfully started", "NestApplication");
    }
  }

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
