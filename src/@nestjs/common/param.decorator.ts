import "reflect-metadata";

export const createParamDecorator = (key: string) => {
  return (data?: any) => {
    // 这里处理装饰器
    return (target: any, propertyKey: string, parameterIndex: number) => {
      // 给控制器类的原型propertyKey也就是handleRequest方法上添加元数据
      // 属性名是params:handleRequest 值是一个数组， 数组里应该防治数据，表示哪个位置使用哪个装饰器
      const existingParameters =
        Reflect.getMetadata(`params`, target, propertyKey) || [];
      // existingParameters.push({ parameterIndex, key });
      existingParameters[parameterIndex] = { parameterIndex, key, data };
      //   existingParameters[parameterIndex] = key;
      Reflect.defineMetadata(`params`, existingParameters, target, propertyKey);
    };
  };
};

export const Request = createParamDecorator("Request");
export const Req = createParamDecorator("Req");
export const Query = createParamDecorator("Query");
export const Headers = createParamDecorator("Headers");
export const Session = createParamDecorator("Session");
export const Ip = createParamDecorator("Ip");
export const Param = createParamDecorator("Param");
export const Body = createParamDecorator("Body");
export const Response = createParamDecorator("Response");
export const Res = createParamDecorator("Res");
export const Next = createParamDecorator("Next");
