import {
  PipeTransform,
  Injectable,
  //   ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class ParseEnumPipe implements PipeTransform<string, any> {
  constructor(private readonly enumType: any) {}
  transform(value: string): any {
    const enumValues = Object.values(this.enumType);
    if (!enumValues.includes(value)) {
      throw new BadRequestException(
        `validation failed (${value} is valid enum), should be one of ${JSON.stringify(
          enumValues
        )}`
      );
    }
    return value;
  }
}
