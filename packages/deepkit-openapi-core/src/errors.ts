import { ClassType, getClassName } from "@deepkit/core";
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

export class DeepKitOpenApiSchemaNameConflict extends DeepKitOpenApiError {
  constructor(public newType: Type, public oldType: Type, public name: string) {
    super(
      `${stringifyType(newType)} and ${stringifyType(
        oldType,
      )} are not the same, but their schema are both named as ${JSON.stringify(
        name,
      )}. ` +
        `Try to fix the naming of related types, or rename them using 'YourClass & Name<ClassName>'`,
    );
  }
}

export class DeepKitOpenApiControllerNameConflict extends DeepKitOpenApiError {
  constructor(
    public newController: ClassType,
    public oldController: ClassType,
    public name: string,
  ) {
    super(
      `${getClassName(newController)} and ${getClassName(
        oldController,
      )} are both tagged as ${name}. ` + `Please consider renaming them. `,
    );
  }
}

export class DeepKitOpenApiOperationNameConflict extends DeepKitOpenApiError {
  constructor(
    public fullPath: string,
    public method: string,
  ) {
    super(`Operation ${method} ${fullPath} is repeated. Please consider renaming them. `);
  }
}

