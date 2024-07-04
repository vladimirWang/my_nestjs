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
    Reflect.defineMetadata("controllers", metadata.controllers, target);
    Reflect.defineMetadata("providers", metadata.providers, target);
    Reflect.defineMetadata("imports", metadata.imports, target);
    Reflect.defineMetadata("exports", metadata.exports, target);
  };
}
