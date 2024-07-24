import "reflect-metadata";
import { ExceptionFilter } from "./exception-filter.interface";

export function UseFilters(...filters: any[]) {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (descriptor) {
      Reflect.defineMetadata("filters", filters, descriptor.value);
    } else {
      Reflect.defineMetadata("filters", filters, target);
    }
  };
}
