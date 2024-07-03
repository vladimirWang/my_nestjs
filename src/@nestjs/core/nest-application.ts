import "reflect-metadata";
import { Logger } from "./logger";
import express, {
  Express,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { Controller, DESIGN_PARAMTYPES, INJECTED_TOKENS } from "../common";
import path from "path";
import { LoggerSerive, UseValueService } from "../../logger.service";

export class NestApplication {
  private readonly app: Express = express();
  private readonly providers = new Map();
  constructor(protected readonly module) {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((req, res, next) => {
      req.user = { name: "admin", age: 12 };
      next();
    });
    this.initProviders();
  }
  initProviders() {
    const providers = Reflect.getMetadata("providers", this.module) ?? [];
    for (const provider of providers) {
      if (provider.provide && provider.useClass) {
        const dependencies = this.resolveDependies(provider.useClass);
        const classInstance = new provider.useClass(...dependencies);
        this.providers.set(provider.provide, classInstance);
      } else if (provider.provide && provider.useValue) {
        this.providers.set(provider.provide, provider.useValue);
      } else if (provider.provide && provider.useFactory) {
        const inject = provider.inject ?? [];
        const injectedValues = inject.map(this.getProviderByToken);
        this.providers.set(
          provider.provide,
          provider.useFactory(...injectedValues)
        );
      } else {
        const dependencies = this.resolveDependies(provider);
        console.log(dependencies, "---pendencies");
        this.providers.set(provider, new provider(...dependencies));
      }
    }
  }

  private getResponseMetadata(controller: Function, methodName: string) {
    const paramMetadata =
      Reflect.getMetadata("params", controller, methodName) ?? [];
    console.log("paramMetadata: ", paramMetadata);
    return paramMetadata
      .filter(Boolean)
      .find(
        (param) =>
          param.key === "Res" ||
          param.key === "Response" ||
          param.key === "Next"
      );
  }

  private getProviderByToken = (token) => {
    console.log(token, "---token");
    return this.providers.get(token) ?? token;
  };

  private resolveDependies(Clazz) {
    const injectedTokens = Reflect.getMetadata(INJECTED_TOKENS, Clazz) ?? [];
    const constructorParams =
      Reflect.getMetadata(DESIGN_PARAMTYPES, Clazz) ?? [];
    return constructorParams.map((param, index) => {
      return this.getProviderByToken(injectedTokens[index] ?? param);
    });
  }

  //   初始化工作
  async init() {
    // 取出模块里所有的控制器，然后做好路由配置
    const controllers = Reflect.getMetadata("controllers", this.module) || [];
    Logger.log(`AppModule dependencies initialized`, "InstanceLoader");

    // 路由映射的核心是知道，什么养的请求方法什么的路径对应的哪个处理函数
    for (const Controller of controllers) {
      const dependencies = this.resolveDependies(Controller);
      // 获取每个控制器实例
      const controller = new Controller(...dependencies);
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
        const redirectUrl = Reflect.getMetadata("redirectUrl", method);
        const redirectStatusCode = Reflect.getMetadata(
          "redirectStatusCode",
          method
        );
        const statusCode = Reflect.getMetadata("statusCode", method);
        const header = Reflect.getMetadata("headers", method) ?? [];
        if (!httpMethod) continue;

        const routePath = path.posix.join("/", prefix, pathMetadata);
        this.app[httpMethod.toLowerCase()](
          routePath,
          (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
            const args = this.resolveParams(
              Reflect.getPrototypeOf(controller),
              methodName,
              req,
              res,
              next
            );
            const result = method.call(controller, ...args);
            if (result?.url) {
              res.redirect(result?.statusCode || 302, result.url);
              return;
            }
            if (redirectUrl) {
              res.redirect(redirectStatusCode || 302, redirectUrl);
              return;
            }
            if (statusCode) {
              res.statusCode = statusCode;
            } else {
              if (httpMethod === "POST") {
                res.statusCode = 201;
              }
            }

            // 判断controller的methodName方法里有没有使用Response或Res参数装饰器，如果用了
            // 任何一个则不发送响应
            const responseMetadata = this.getResponseMetadata(
              controller,
              methodName
            );
            if (!responseMetadata || responseMetadata?.data?.passthrough) {
              header.forEach((item) => {
                const { key, value } = item;
                res.setHeader(key, value);
              });
              res.send(result);
            }
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

  private resolveParams(
    instance: any,
    methodName: string,
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ) {
    const paramsMetaData =
      Reflect.getMetadata(`params`, instance, methodName) ?? [];
    return paramsMetaData.map((paramMetaData) => {
      const { key, data, factory } = paramMetaData;
      const ctx = {
        switchToHttp() {
          return {
            getRequest: () => req,
            getResponse: () => res,
            getNext: () => next,
          };
        },
      };
      switch (key) {
        case "Request":
        case "Req":
          return req;
        case "Response":
        case "Res":
          return res;
        case "Query":
          return data ? req.query[data] : req.query;
        case "Headers":
          return data ? req.headers[data] : req.headers;
        case "Session":
          return data ? req.session[data] : req.session;
        case "Ip":
          return req.ip;
        case "Param":
          return data ? req.params[data] : req.params;
        case "Body":
          return data ? req.body[data] : req.body;
        case "Next":
          return next;
        case "DecoratorFactory":
          return factory(data, ctx);
        default:
          return null;
      }
    });
  }

  use(middleware) {
    this.app.use(middleware);
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
