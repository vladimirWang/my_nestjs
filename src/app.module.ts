import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { LoggerModule } from "./logger.module";
import {
  LoggerService,
  UseValueService,
  UseFactory,
  LoggerClassSerive,
} from "./logger.service";
import { CoreModule } from "./core.module";

@Module({
  imports: [
    // LoggerModule
    CoreModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
