import "reflect-metadata";

export function Catch(...exceptions) {
  return (target: Function) => {
    Reflect.defineMetadata("catch", exceptions, target);
  };
}
