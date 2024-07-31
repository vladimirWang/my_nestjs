import "reflect-metadata";
import { PipeTransform } from "./pipe-transform.interface";

export function UsePipes(...pipes: PipeTransform[]) {
  return (
    target: object | Function,
    propertyKey?: string,
    descriptor?: TypedPropertyDescriptor<any>
  ) => {
    if (descriptor) {
      Reflect.defineMetadata("pipes", pipes, descriptor.value);
    } else {
      Reflect.defineMetadata("pipes", pipes, target);
    }
  };
}
