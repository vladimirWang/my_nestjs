import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { LoggerModule } from "./logger.module";
import {
  LoggerService,
  UseValueService,
  UseFactory,
  LoggerClassSerive,
} from "./logger.service";
import { CommonModule } from "./common.module";
import { OtherModule } from "./other.module";

@Module({
  imports: [LoggerModule, CommonModule, OtherModule],
  controllers: [AppController],
})
export class AppModule {}
