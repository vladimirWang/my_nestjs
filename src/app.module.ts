import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { UserController } from "./user.controller";
import {
  LoggerSerive,
  UseValueService,
  UseFactory,
  LoggerClassSerive,
} from "./logger.service";

@Module({
  controllers: [AppController, UserController],
  providers: [
    {
      provide: "SUFFIX",
      useValue: "suffix",
    },
    LoggerClassSerive,
    {
      provide: LoggerSerive,
      useClass: LoggerSerive,
    },
    {
      provide: "StringToken",
      useValue: new UseValueService("prefix"),
    },
    {
      provide: "FactoryToken",
      inject: ["prefix1", "SUFFIX"],
      useFactory: (prefix1, prefix2) => new UseFactory(prefix1, prefix2),
    },
  ],
})
export class AppModule {}
