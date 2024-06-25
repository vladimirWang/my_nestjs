import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import session from "express-session";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    session({
      secret: "your-secret",
      resave: false, // 每次请求结束后是否强制保存会话，几十它没有改改变
      saveUninitialized: false, // 是否保存未初始化的会话
      cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 设置cookie最大存活时间
    })
  );
  await app.listen(3000);
}

bootstrap();
