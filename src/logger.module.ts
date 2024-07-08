import { Module } from "@nestjs/common";
import {
  LoggerClassSerive,
  LoggerService,
  UseValueService,
  UseFactory,
} from "./logger.service";

@Module({
  providers: [
    {
      provide: "SUFFIX",
      useValue: "suffix",
    },
    LoggerClassSerive,
    {
      provide: LoggerService,
      useClass: LoggerService,
    },
    {
      provide: "StringToken",
      useValue: new UseValueService("prefix"),
    },
    {
      provide: "FactoryToken",
      //   inject: ["prefix1", "SUFFIX"],
      //   useFactory: (prefix1, prefix2) => new UseFactory(prefix1, prefix2),
      useFactory: () => new UseFactory(),
    },
  ],
  exports: [
    "SUFFIX",
    LoggerClassSerive,
    LoggerService,
    "StringToken",
    "FactoryToken",
  ],
})
export class LoggerModule {}
