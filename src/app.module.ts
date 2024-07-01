import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { UserController } from "./user.controller";
import { LoggerSerive, UseValueService } from "./logger.service";

@Module({
  controllers: [AppController, UserController],
  providers: [
    LoggerSerive,
    {
      provide: "StringToken",
      useValue: new UseValueService(),
    },
  ],
})
export class AppModule {}
