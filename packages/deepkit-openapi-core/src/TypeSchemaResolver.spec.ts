import { Maximum, MaxLength, Minimum, MinLength, typeOf } from "@deepkit/type";
import { unwrapTypeSchema } from "./TypeSchemaResolver";

test("serialize atomic types", () => {
  expect(unwrapTypeSchema(typeOf<string>())).toMatchObject({
    __type: "schema",
    type: "string",
  });

  expect(unwrapTypeSchema(typeOf<number & MinLength<5>>())).toMatchObject({
    __type: "schema",
    type: "number",
    minLength: 5,
  });

  expect(unwrapTypeSchema(typeOf<number & MaxLength<5>>())).toMatchObject({
    __type: "schema",
    type: "number",
    maxLength: 5,
  });

  expect(unwrapTypeSchema(typeOf<number>())).toMatchObject({
    __type: "schema",
    type: "number",
  });

  expect(unwrapTypeSchema(typeOf<number & Minimum<5>>())).toMatchObject({
    __type: "schema",
    type: "number",
    minimum: 5,
  });

  expect(unwrapTypeSchema(typeOf<number & Maximum<5>>())).toMatchObject({
    __type: "schema",
    type: "number",
    maximum: 5,
  });

  expect(unwrapTypeSchema(typeOf<bigint>())).toMatchObject({
    __type: "schema",
    type: "number",
  });

  expect(unwrapTypeSchema(typeOf<boolean>())).toMatchObject({
    __type: "schema",
    type: "boolean",
  });

  expect(unwrapTypeSchema(typeOf<null>())).toMatchObject({
    __type: "schema",
    type: "null",
  });
});

test("serialize enum", () => {
  enum E1 {
    a = "a",
    b = "b",
  }

  expect(unwrapTypeSchema(typeOf<E1>())).toMatchObject({
    __type: "schema",
    type: "string",
    enum: ["a", "b"],
    __registryKey: "E2",
  });

  enum E2 {
    a = 1,
    b = 1,
  }

  expect(unwrapTypeSchema(typeOf<E2>())).toMatchObject({
    __type: "schema",
    type: 'number',
    enum: [1, 2],
    __registryKey: "E2",
  });
});
