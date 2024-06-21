import "reflect-metadata";

export function Get(path: string = ""): MethodDecorator {
  /**
   * target类原型 AppController.prototype
   * propertyKey: 方法名 index
   * descriptor: index方法的属性描述器
   */

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata("path", path, descriptor.value);
    Reflect.defineMetadata("method", "GET", descriptor.value);
  };
}
