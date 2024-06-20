import "reflect-metadata";

export function Get(): MethodDecorator {
  return (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {};
}
