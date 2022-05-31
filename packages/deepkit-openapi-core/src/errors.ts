import { stringifyType, Type } from "@deepkit/type";

export class DeepKitOpenApiError extends Error {}

export class DeepKitTypeError extends DeepKitOpenApiError {}

export class TypeNotSupported extends DeepKitTypeError {
  constructor(public type: Type, public reason: string = "") {
    super(`${stringifyType(type)} is not supported. ${reason}`);
  }
}

export class LiteralSupported extends DeepKitTypeError {
  constructor(public typeName: string) {
    super(`${typeName} is not supported. `);
  }
}

export class DeepKitTypeErrors extends DeepKitOpenApiError {
  constructor(public errors: DeepKitTypeError[], message: string) {
    super(message);
  }
}

export class DeepKitOpenApiNameConflict extends DeepKitOpenApiError {
  constructor(public newType: Type, public oldType: Type, public name: string) {
    super(
      `${stringifyType(newType)} and ${stringifyType(
        oldType,
      )} are not the same, but they are both named as ${JSON.stringify(
        name,
      )}. ` +
        `Try to fix the naming of related types, or rename them using 'YourClass & Name<ClassName>'`,
    );
  }
}
