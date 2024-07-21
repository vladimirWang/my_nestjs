import { ArgumentsHost } from "./arguments-host.interface";

export interface ExceptionFilter<T = any> {
  catch(exeption: T, host: ArgumentsHost): any;
}
