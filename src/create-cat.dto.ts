import { z } from "zod";

export const createCatSchema = z
  .object({
    name: z.string(), // 定义name的属性，类型必须为字符串
    age: z.number(),
  })
  .required(); // 所有字段为必填项

// 通过zod的infer方法从createCatSchema推导出一个类型
export type CreateCatDto = z.infer<typeof createCatSchema>;
