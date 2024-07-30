import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AppController } from "./app.controller";
import { App2Controller } from "./app2.controller";
import { DynamicConfigModule } from "./dynamicConfig.module";
import {
  LoggerService,
  UseValueService,
  UseFactory,
  LoggerClassSerive,
} from "./logger.service";
import { AppService } from "./app.service";
import { LoggerMiddleware } from "./logger.middleware";
import { loggerFunction } from "./logger-function.middleware";

function logger1(req, res, next) {
  console.log("logger11");
  next();
}

function logger2(req, res, next) {
  console.log("logger22");
  next();
}
@Module({
  // imports: [LoggerModule, CommonModule, OtherModule],
  // imports: [DynamicConfigModule.forRoot("hello")],
  controllers: [App2Controller, AppController],
  providers: [
    {
      provide: "PREFIX",
      useValue: "prefix",
    },
    AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: CustomExceptionFilter,
    // },
  ],
  // exports: [AppService],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       // .apply(LoggerMiddleware)
//       .apply(logger1)
//       .forRoutes(AppController)
//       .apply(logger2)
//       .forRoutes(App2Controller);
//   }
// }
