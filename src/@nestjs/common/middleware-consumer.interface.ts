import { RequestMethod } from "./request.method.enum";

export interface MiddlewareConsumer {
  apply(...middlewares: any[]): this;
  forRoutes(
    ...routes: Array<
      string | { path: string; method: RequestMethod } | Function
    >
  );
  exclude(
    ...routes: Array<
      string | { path: string; method: RequestMethod } | Function
    >
  );
}
