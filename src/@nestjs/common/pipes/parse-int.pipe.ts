import {
  PipeTransform,
  Injectable,
  //   ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(
    value: string
    // , metadata: ArgumentMetadata
  ): number {
    const val = parseInt(value);
    if (isNaN(val)) {
      throw new BadRequestException(
        `validation failed (numeric string is expected), but found ${value}`
      );
    }
    return val;
  }
}
