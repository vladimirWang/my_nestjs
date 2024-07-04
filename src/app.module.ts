import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { LoggerModule } from "./logger.module";
import {
  LoggerService,
  UseValueService,
  UseFactory,
  LoggerClassSerive,
} from "./logger.service";

@Module({
  imports: [LoggerModule],
  controllers: [AppController],
})
export class AppModule {}
