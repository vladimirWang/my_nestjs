import {
  PipeTransform,
  Injectable,
  //   ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class DefaultValuePipe implements PipeTransform<string, any> {
  constructor(private readonly defaultValue: any) {}
  transform(
    value: string
    // , metadata: ArgumentMetadata
  ): any {
    return value !== undefined ? value : this.defaultValue;
  }
}
