import { stringifyType, Type } from "@deepkit/type";

export class DeepKitOpenApiError extends Error {}

export class TypeNotSupported extends DeepKitOpenApiError {
  constructor(public type: Type, public reason: string = "") {
    super(`${stringifyType(type)} is not supported. ${reason}`);
  }
}
