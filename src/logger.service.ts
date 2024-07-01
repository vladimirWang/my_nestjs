import { Injectable } from "@nestjs/common";

@Injectable()
export class LoggerSerive {
  log(message) {
    console.log(`loggerService, `, message);
  }
}

@Injectable()
export class UseValueService {
  log(message) {
    console.log(`loggerService, `, message);
  }
}
