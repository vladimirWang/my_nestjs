import {
  PipeTransform,
  Injectable,
  //   ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

interface ParseArrayOptions {
  items: any;
  separator?: string;
}

@Injectable()
export class ParseArrayPipe implements PipeTransform<string, any[]> {
  constructor(private readonly options: ParseArrayOptions) {}
  transform(
    value: string
    // , metadata: ArgumentMetadata
  ): any[] {
    if (!value) {
      return [];
    }
    const { items = String, separator = "," } = this.options ?? {};
    const res = value.split(separator).map((item) => {
      if (items === String) {
        return item;
      } else if (items === Number) {
        return Number(item);
      }
    });
    return res;
  }
}
