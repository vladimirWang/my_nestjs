import "reflect-metadata";

interface ModuleMetadata {
  controllers: Function[];
}
export function Module(metadata: ModuleMetadata): ClassDecorator {
  return (target: Function) => {
    // 给模块类添加元数据 AppModule
    Reflect.defineMetadata("controllers", metadata.controllers, target);
  };
}
