import { BadRequestException, PipeTransform } from "@nestjs/common";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}
  transform(value: any, metadata?: any) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException("Validation Failed");
    }
  }
}
