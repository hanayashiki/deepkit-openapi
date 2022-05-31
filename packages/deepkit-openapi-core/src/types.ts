export type SchemaMapper = (s: Schema, ...args: any[]) => Schema;

export type SimpleType = string | number | boolean | null | bigint;

export type Schema = {
  __type: "schema";
  __registryKey?: string;
  __isUndefined?: boolean;
  type?: string;
  not?: Schema;
  pattern?: string;
  multipleOf?: number;
  minLength?: number;
  maxLength?: number;
  minimum?: number | bigint;
  exclusiveMinimum?: number | bigint;
  maximum?: number | bigint;
  exclusiveMaximum?: number | bigint;
  enum?: SimpleType[];
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
};

export const AnySchema: Schema = { __type: "schema" };

export const NumberSchema: Schema = { __type: "schema", type: "number" };

export const StringSchema: Schema = { __type: "schema", type: "string" };

export const BooleanSchema: Schema = { __type: "schema", type: "boolean" };
