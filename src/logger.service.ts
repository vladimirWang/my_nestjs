import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class LoggerClassSerive {
  constructor(@Inject("SUFFIX") private suffix: string) {}
  log(message) {
    console.log(`LoggerClassSerive, `, message, this.suffix);
  }
}
@Injectable()
export class LoggerService {
  constructor(@Inject("SUFFIX") private suffix: string) {
    // console.log("-================LoggerService============: ", this.suffix);
  }
  log(message) {
    console.log(`loggerService, `, message, this.suffix);
  }
}

@Injectable()
export class UseValueService {
  constructor(private prefix: string) {
    console.log("UseValueService: ", prefix);
  }
  log(message) {
    console.log(`loggerService, `, message);
  }
}

@Injectable()
export class UseFactory {
  // constructor(private prefix1: string, private prefix2: string) {
  //   console.log("UseFactory: ", prefix1, prefix2);
  // }
  log(message) {
    // console.log(`UseFactory, `, message, this.prefix2, this.prefix1);
    console.log(`UseFactory, `, message);
  }
}
