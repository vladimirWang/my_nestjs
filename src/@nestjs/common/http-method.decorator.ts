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

export function Post(path: string = ""): MethodDecorator {
  /**
   * target类原型 AppController.prototype
   * propertyKey: 方法名 index
   * descriptor: index方法的属性描述器
   */

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata("path", path, descriptor.value);
    Reflect.defineMetadata("method", "POST", descriptor.value);
  };
}

export function Redirect(
  url: string = "/",
  statusCode: number = 302
): MethodDecorator {
  /**
   * target类原型 AppController.prototype
   * propertyKey: 方法名 index
   * descriptor: index方法的属性描述器
   */

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata("redirectUrl", url, descriptor.value);
    Reflect.defineMetadata("redirectStatusCode", statusCode, descriptor.value);
  };
}
export function HttpCode(statusCode: number = 200): MethodDecorator {
  /**
   * target类原型 AppController.prototype
   * propertyKey: 方法名 index
   * descriptor: index方法的属性描述器
   */

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata("statusCode", statusCode, descriptor.value);
  };
}

export function Header(key: string, value: string): MethodDecorator {
  /**
   * target类原型 AppController.prototype
   * propertyKey: 方法名 index
   * descriptor: index方法的属性描述器
   */

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const existing = Reflect.getMetadata("headers", descriptor.value) ?? [];
    existing.push({ key, value });

    Reflect.defineMetadata("headers", existing, descriptor.value);
  };
}
