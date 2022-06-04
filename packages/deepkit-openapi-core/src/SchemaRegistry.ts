import {
  isPrimitive,
  isSameType,
  metaAnnotation,
  ReflectionKind,
  stringifyType,
  Type,
  TypeClass,
  TypeEnum,
  TypeLiteral,
  TypeObjectLiteral,
  TypeUnion,
} from "@deepkit/type";
import camelcase from "camelcase";
import { DeepKitOpenApiSchemaNameConflict } from "./errors";
import { Schema } from "./types";

export interface SchemeEntry {
  name: string;
  schema: Schema;
  type: Type;
}

export type RegistableSchema =
  | TypeClass
  | TypeObjectLiteral
  | TypeEnum
  | TypeUnion;

export class SchemaRegistry {
  store: Map<string, SchemeEntry> = new Map();

  getSchemaKey(t: RegistableSchema): string {
    const nameAnnotation = metaAnnotation
      .getAnnotations(t)
      .find((t) => t.name === "openapi");

    // Handle user preferred name
    if (
      nameAnnotation?.options[0]?.kind === ReflectionKind.literal &&
      nameAnnotation?.options[0].literal === "name"
    ) {
      return (nameAnnotation?.options[1] as TypeLiteral).literal as string;
    }

    // HttpQueries<T>
    if (
      metaAnnotation.getForName(t, "httpQueries") ||
      metaAnnotation.getForName(t, "httpBody") ||
      metaAnnotation.getForName(t, "httpBodyValidation")
    ) {
      return this.getSchemaKey(
        (t as RegistableSchema).typeArguments![0] as RegistableSchema,
      );
    }

    const rootName =
      t.kind === ReflectionKind.class ? t.classType.name : t.typeName ?? "";

    const args =
      t.kind === ReflectionKind.class
        ? t.arguments ?? []
        : t.typeArguments ?? [];

    return camelcase([rootName, ...args.map((a) => this.getTypeKey(a))], {
      pascalCase: true,
    });
  }

  getTypeKey(t: Type): string {
    if (
      t.kind === ReflectionKind.string ||
      t.kind === ReflectionKind.number ||
      t.kind === ReflectionKind.bigint ||
      t.kind === ReflectionKind.boolean ||
      t.kind === ReflectionKind.null ||
      t.kind === ReflectionKind.undefined
    ) {
      return stringifyType(t);
    } else if (
      t.kind === ReflectionKind.class ||
      t.kind === ReflectionKind.objectLiteral ||
      t.kind === ReflectionKind.enum ||
      t.kind === ReflectionKind.union
    ) {
      return this.getSchemaKey(t);
    } else if (t.kind === ReflectionKind.array) {
      return camelcase([this.getTypeKey(t.type), "Array"], {
        pascalCase: false,
      });
    } else {
      // Complex types not named
      return "";
    }
  }

  registerSchema(name: string, type: Type, schema: Schema) {
    const currentEntry = this.store.get(name);

    if (currentEntry && !isSameType(type, currentEntry?.type)) {
      throw new DeepKitOpenApiSchemaNameConflict(type, currentEntry.type, name);
    }

    this.store.set(name, { type, schema, name });
    schema.__registryKey = name;
  }
}
