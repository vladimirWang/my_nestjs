import clc from "cli-color";

export class Logger {
  private static lastLogTime = Date.now();
  static log(message: string, context: string = "") {
    // 获取当前时间戳
    const timestamp = new Date().toLocaleString();

    // 获取当前进程id
    const pid = process.pid;
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastLogTime;
    console.log(
      `[${clc.green("Nest")}] ${clc(
        pid.toString()
      )}  - ${timestamp}     ${clc.green("LOG")} [${clc.yellow(
        context
      )}] ${clc.green(message)} +${clc.green(timeDiff)}ms`
    );
    this.lastLogTime = currentTime;
  }
}
