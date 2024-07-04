import "reflect-metadata";

interface ModuleMetadata {
  controllers?: Function[];
  providers?: any[];
  imports?: any[];
  exports?: any[];
}
export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: Function) => {
    // 给模块类添加元数据 AppModule
    // 当一个类使用Module装饰器时就可以添加标识他是一个模块的元数据
    Reflect.defineMetadata("isModule", true, target);
    Reflect.defineMetadata("controllers", metadata.controllers, target);
    Reflect.defineMetadata("providers", metadata.providers, target);
    Reflect.defineMetadata("imports", metadata.imports, target);
    Reflect.defineMetadata("exports", metadata.exports, target);
  };
}
