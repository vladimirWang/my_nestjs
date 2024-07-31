export interface ArgumentMetadata {
  type: "body" | "query" | "param" | "custom";
  metatype?;
  data?: string;
}
