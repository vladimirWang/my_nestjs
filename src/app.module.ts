import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { DynamicConfigModule } from "./dynamicConfig.module";
import {
  LoggerService,
  UseValueService,
  UseFactory,
  LoggerClassSerive,
} from "./logger.service";
import { AppService } from "./app.service";
// import { CommonModule } from "./common.module";
// import { OtherModule } from "./other.module";
// import { LoggerModule } from "./logger.module";

@Module({
  // imports: [LoggerModule, CommonModule, OtherModule],
  imports: [DynamicConfigModule.forRoot("hello")],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
