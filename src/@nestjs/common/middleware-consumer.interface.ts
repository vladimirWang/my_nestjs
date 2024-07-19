import { RequestMethod } from "./request.method.enum";

export interface MiddlewareConsumer {
  apply(...middlewares): this;
  forRoutes(...routes: Array<string | { path: string; method: RequestMethod }>);
  exclude(...routes: Array<string | { path: string; method: RequestMethod }>);
}
