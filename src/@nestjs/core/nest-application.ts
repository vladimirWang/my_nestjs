import "reflect-metadata";
import { Logger } from "./logger";
import express, {
  Express,
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { ArgumentsHost, Controller, RequestMethod } from "@nestjs/common";
import path from "path";
import { LoggerService, UseValueService } from "../../logger.service";
import { APP_FILTER } from "./constants";
import { DESIGN_PARAMTYPES, INJECTED_TOKENS } from "../common/constants";
import { defineModule } from "../common/module.decorator";
import { GlobalHttpExceptionFilter } from "../common/http-exception.filter";

export class NestApplication {
  private readonly app: Express = express();
  // 保存所有provider的实例，key是token，值就是类的实例或者值
  private readonly providerInstances = new Map();
  // 记录每个模块里有哪些 provider的token
  private readonly moduleProviders = new Map();

  private readonly globalProviders = new Set();

  // 记录所有中间件, 可能是类，也可能是中间件实例，或函数中间件
  private readonly middlewares = [];
  // 记录所有要排除的路径
  private readonly excludeRoutes = [];

  // 默认全局异常过滤器
  private readonly defaultGlobalHttpExceptionFilter =
    new GlobalHttpExceptionFilter();

  // 用户配置的全局异常过滤器
  private readonly globalHttpExceptionFilters = [];

  // 一个全局异常过滤器
  constructor(protected readonly module) {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use((req, res, next) => {
      req.user = { name: "admin", age: 12 };
      next();
    });
  }

  useGlobalFilters(...filters) {
    defineModule(
      this.module,
      filters.filter((filter) => filter instanceof Function)
    );
    this.globalHttpExceptionFilters.push(...filters);
  }

  exclude(...routeInfos) {
    this.excludeRoutes.push(...routeInfos.map(this.normalizeRouteInfo));
    return this;
  }

  private initMiddlewares() {
    // 调用配置中间件的方法，MiddlewareConsumer就是当前的NestApplication的实例
    this.module.prototype.configure?.(this);
  }

  apply(...middleware) {
    defineModule(this.module, middleware);
    this.middlewares.push(...middleware);
    return this;
  }
  isExcluded(reqPath: string, method: RequestMethod): boolean {
    return (
      this.excludeRoutes.find((item) => {
        const { routePath, routeMehtod } = item;
        return (
          item.routePath === reqPath &&
          (routeMehtod === method || routeMehtod === RequestMethod.ALL)
        );
      }) !== undefined
    );
  }

  forRoutes(...routes) {
    for (const route of routes) {
      for (const middleware of this.middlewares) {
        const { routePath, routeMehtod } = this.normalizeRouteInfo(route);
        this.app.use(routePath, (req, res, next) => {
          if (this.isExcluded(req.originalUrl, req.method)) {
            return next();
          }
          // 如果方法名是all或完全匹配，则就可以执行中间件
          if (routeMehtod === RequestMethod.ALL || routeMehtod === req.method) {
            if ("use" in middleware.prototype || "use" in middleware) {
              const middlewareInstance = this.getMiddlewareInstance(middleware);
              middlewareInstance.use(req, res, next);
            } else if (middleware instanceof Function) {
              middleware(req, res, next);
            }
          } else {
            next();
          }
        });
      }
    }
    this.middlewares.length = 0;
    return this;
  }

  private getMiddlewareInstance(middleware) {
    if (middleware instanceof Function) {
      const dependencies = this.resolveDependies(middleware);
      return new middleware(...dependencies);
    }
    return middleware;
  }

  private normalizeRouteInfo(route) {
    let routePath = "",
      routeMehtod = RequestMethod.ALL;
    if (typeof route === "string") {
      routePath = route;
    } else if ("path" in route) {
      routePath = route.path;
      routeMehtod = route.method ?? RequestMethod.ALL;
    } else if (route instanceof Function) {
      routePath = Reflect.getMetadata("prefix", route);
    }
    routePath = path.posix.join("/", routePath);
    return { routePath, routeMehtod };
  }

  private registerProvidersFromModule(module, ...parentModules) {
    // 获取导入的是否为全局模块
    const global = Reflect.getMetadata("global", module);
    // 拿到导入模块的providers进行全量注册
    // 有可能导入的模块至导出了一部分，并没有全量导出，需要用exports对providers进行过滤
    const importedProviders = Reflect.getMetadata("providers", module) ?? [];
    const exports = Reflect.getMetadata("exports", module) ?? [];
    for (const exportToken of exports) {
      if (this.isModule(exportToken)) {
        //  儿子          自己        父亲
        // exportToken, module, ...parentModules
        this.registerProvidersFromModule(exportToken, module, ...parentModules);
      } else {
        const provider = importedProviders.find(
          (provider) =>
            provider === exportToken || provider.provide === exportToken
        );
        if (provider) {
          [module, ...parentModules].forEach((module) => {
            this.addProvider(provider, module, global);
          });
        }
      }
    }
    this.initController(module);
  }

  private isModule(exportToken) {
    return (
      exportToken &&
      exportToken instanceof Function &&
      Reflect.getMetadata("isModule", exportToken)
    );
  }

  private async initProviders() {
    const imports = Reflect.getMetadata("imports", this.module) ?? [];
    for (const importModule of imports) {
      let importedModule = importModule;
      if (importModule instanceof Promise) {
        importedModule = await importModule;
      }
      if ("module" in importedModule) {
        const {
          module,
          providers = [],
          exports = [],
          controllers = [],
        } = importedModule;
        const oldProviders = Reflect.getMetadata("providers", module) ?? [];
        const newProviders = [...oldProviders, ...providers];
        defineModule(module, newProviders);
        const oldControllers = Reflect.getMetadata("controllers", module) ?? [];
        const newControllers = [...oldControllers, ...controllers];
        defineModule(module, newControllers);
        const oldExports = Reflect.getMetadata("exports", module) ?? [];
        const newExports = [...oldExports, ...exports];
        Reflect.defineMetadata("providers", newProviders, module);
        Reflect.defineMetadata("exports", newExports, module);
        Reflect.defineMetadata("controllers", newControllers, module);
        this.registerProvidersFromModule(module, this.module);
      } else {
        this.registerProvidersFromModule(importedModule, this.module);
      }
    }
    const providers = Reflect.getMetadata("providers", this.module) ?? [];
    for (const provider of providers) {
      this.addProvider(provider, this.module);
    }
  }

  // 原来的provider都放一起，现在分开
  private addProvider(provider, module, global: boolean = false) {
    const providers = global
      ? this.globalProviders
      : this.moduleProviders.get(module) || new Set();
    if (!global) {
      this.moduleProviders.set(module, providers);
    }

    // 此provider代表module这个模块对应的provider的token
    const injectedToken = provider.provide ?? provider;
    if (this.providerInstances.has(injectedToken)) {
      providers.add(injectedToken);
      return;
    }

    if (provider.provide) {
      providers.add(provider.provide);
      if (provider.useClass) {
        const dependencies = this.resolveDependies(provider.useClass);
        const classInstance = new provider.useClass(...dependencies);
        this.providerInstances.set(provider.provide, classInstance);
      } else if (provider.useValue) {
        this.providerInstances.set(provider.provide, provider.useValue);
      } else if (provider.useFactory) {
        const inject = provider.inject ?? [];
        const injectedValues = inject.map((injectToken) =>
          this.getProviderByToken(injectToken, module)
        );
        this.providerInstances.set(
          provider.provide,
          provider.useFactory(...injectedValues)
        );
      }
    } else {
      const dependencies = this.resolveDependies(provider);
      this.providerInstances.set(provider, new provider(...dependencies));
      providers.add(provider);
    }
  }

  private getResponseMetadata(controller: Function, methodName: string) {
    const paramMetadata =
      Reflect.getMetadata("params", controller, methodName) ?? [];
    return paramMetadata
      .filter(Boolean)
      .find(
        (param) =>
          param.key === "Res" ||
          param.key === "Response" ||
          param.key === "Next"
      );
  }

  private getProviderByToken = (injectedToken, module) => {
    // 如何通过token在特定模块下找对应的provider
    // 先找到此模块对应的set，在判断injectedToken是否在set中
    // 如果存在则返回实例
    if (
      this.moduleProviders.get(module)?.has(injectedToken) ||
      this.globalProviders.has(injectedToken)
    ) {
      return this.providerInstances.get(injectedToken);
    } else {
      return null;
    }
  };

  private resolveDependies(Clazz) {
    const injectedTokens = Reflect.getMetadata(INJECTED_TOKENS, Clazz) ?? [];
    const constructorParams =
      Reflect.getMetadata(DESIGN_PARAMTYPES, Clazz) ?? [];
    // console.log("--injectedTokens--", injectedTokens);
    // console.log("--constructorParams--", constructorParams);
    return constructorParams.map((param, index) => {
      const module = Reflect.getMetadata("module", Clazz);
      return this.getProviderByToken(injectedTokens[index] ?? param, module);
    });
  }

  //   初始化工作
  async initController(module) {
    // 取出模块里所有的控制器，然后做好路由配置
    const controllers = Reflect.getMetadata("controllers", module) || [];
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

      // 获取控制上绑定的异常过滤器
      const controllerFilters =
        Reflect.getMetadata("filters", Controller) ?? [];

      defineModule(
        module,
        controllerFilters.filter((filter) => filter instanceof Function)
      );

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

        // 获取控制上绑定的异常过滤器
        const methodFilters = Reflect.getMetadata("filters", method) ?? [];

        defineModule(
          module,
          methodFilters.filter((filter) => filter instanceof Function)
        );

        const routePath = path.posix.join("/", prefix, pathMetadata);
        this.app[httpMethod.toLowerCase()](
          routePath,
          async (
            req: ExpressRequest,
            res: ExpressResponse,
            next: NextFunction
          ) => {
            const host = {
              switchToHttp() {
                return {
                  getRequest: () => req,
                  getResponse: () => res,
                  getNext: () => next,
                };
              },
            };
            try {
              const args = this.resolveParams(
                Reflect.getPrototypeOf(controller),
                methodName,
                req,
                res,
                next,
                host
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
            } catch (error) {
              await this.callExceptionFilters(error, host, [
                ...methodFilters,
                ...controllerFilters,
              ]);
            }
          }
        );
      }
      Logger.log("Nest application successfully started", "NestApplication");
    }
  }

  getFilterInstance(filter) {
    if (filter instanceof Function) {
      const dependencies = this.resolveDependies(filter);
      return new filter(...dependencies);
    }
    return filter;
  }

  private callExceptionFilters(error, host, filters) {
    const allFilters = [
      ...filters,
      ...this.globalHttpExceptionFilters,
      this.defaultGlobalHttpExceptionFilter,
    ];
    for (const filter of allFilters) {
      let filterInstance = this.getFilterInstance(filter);
      if (filterInstance instanceof Function) {
        filterInstance = new filterInstance();
      }
      const exceptions =
        Reflect.getMetadata("catch", filterInstance.constructor) ?? [];

      /**
       * 1 是httpException的实例，返回自定义的错误
       * 2 否则展示Internal Server Error
       */
      if (
        exceptions.length === 0 ||
        exceptions.some((exception) => error instanceof exception)
      ) {
        filterInstance.catch(error, host);
        break;
      }
    }
  }

  private resolveParams(
    instance: any,
    methodName: string,
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction,
    host
  ) {
    const paramsMetaData =
      Reflect.getMetadata(`params`, instance, methodName) ?? [];
    return paramsMetaData.map((paramMetaData) => {
      const { key, data, factory, pipes } = paramMetaData;
      let value;
      switch (key) {
        case "Request":
        case "Req":
          value = req;
          break;
        case "Response":
        case "Res":
          value = res;
          break;
        case "Query":
          value = data ? req.query[data] : req.query;
          break;
        case "Headers":
          value = data ? req.headers[data] : req.headers;
          break;
        case "Session":
          value = data ? req.session[data] : req.session;
          break;
        case "Ip":
          value = req.ip;
          break;
        case "Param":
          value = data ? req.params[data] : req.params;
          break;
        case "Body":
          value = data ? req.body[data] : req.body;
          break;
        case "Next":
          value = next;
          break;
        case "DecoratorFactory":
          value = factory(data, host);
          break;
        default:
          value = null;
      }
      for (const pipe of [...pipes]) {
        const pipeInstance = this.getPipeInstance(pipe);
        value = pipeInstance.transform(value);
      }
      return value;
    });
  }

  getPipeInstance(pipe) {
    if (typeof pipe === "function") {
      const dependencies = this.resolveDependies(pipe);
      return new pipe(...dependencies);
    }
    return pipe;
  }

  use(middleware) {
    this.app.use(middleware);
  }

  async initGlobalFilters() {
    const providers = Reflect.getMetadata("providers", this.module) ?? [];
    for (const provider of providers) {
      if (provider.provide === APP_FILTER) {
        const provideInstance = this.getProviderByToken(
          APP_FILTER,
          this.module
        );
        this.useGlobalFilters(provideInstance);
      }
    }
  }

  async listen(port: number) {
    await this.initProviders();
    await this.initMiddlewares();
    await this.initGlobalFilters();
    await this.initController(this.module);
    // 调用express实例的listen方法
    this.app.listen(port, () => {
      Logger.log(
        `Application is running on http://localhost:${port}`,
        "NestApplication"
      );
    });
  }
}
