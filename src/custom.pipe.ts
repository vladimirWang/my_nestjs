import { ArgumentMetadata, PipeTransform } from "@nestjs/common";

export class CustomPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): any {
    console.log(`value: ${value}`);
    console.log(`metadata: ${JSON.stringify(metadata)}`);
    return value;
  }
}
