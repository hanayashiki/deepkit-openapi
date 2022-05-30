import { ReflectionKind, Type, TypeNever } from "@deepkit/type";
import { TypeNotSupported } from "./errors";

export const mapTypeToSchema = (t: Type) => {
  switch (t.kind) {
    case ReflectionKind.never:
      return {
        not: {},
      };
    case ReflectionKind.any:
    case ReflectionKind.unknown:
    case ReflectionKind.void:
      return {};
    case ReflectionKind.object:
      return {
        type: 'object',
      };
    
  }
};
