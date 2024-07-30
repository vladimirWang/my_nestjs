import {
  PipeTransform,
  Injectable,
  //   ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class ParseBoolPipe implements PipeTransform<string, boolean> {
  transform(
    value: string
    // , metadata: ArgumentMetadata
  ): boolean {
    const val = parseInt(value);
    if (value.toLowerCase() === "true") {
      return true;
    } else if (value.toLowerCase() === "false") {
      return false;
    } else {
      throw new BadRequestException(
        `validation failed (boolean string is expected), but found ${value}`
      );
    }
  }
}
