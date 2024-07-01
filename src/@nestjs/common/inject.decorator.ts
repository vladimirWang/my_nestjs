import "reflect-metadata";
import { INJECTED_TOKENS } from "./const";

export function Inject(token: string): ParameterDecorator {
  /**
   * target 类
   * propertyKey: 方法名
   * paramIndex: 参数索引
   */
  return (target: Object, propertyKey: string, paramIndex: number) => {
    const existingTokens = Reflect.getMetadata(INJECTED_TOKENS, target) ?? [];
    existingTokens[paramIndex] = token;
    Reflect.defineMetadata(INJECTED_TOKENS, existingTokens, target);
  };
}
