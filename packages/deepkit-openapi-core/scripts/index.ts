import {
  typeOf,
  MinLength,
  TypedArray,
  reflect,
  TypeEnum,
} from "@deepkit/type";
import { unwrapTypeSchema } from "../src/TypeSchemaResolver";
import { stringify } from "yaml";
import { SchemaRegistry } from "../src/SchemaRegistry";
import { HttpQueries } from "@deepkit/http";

// console.log(typeOf<'a' | 'b' | 'c'>());

// console.log(typeOf<'a' | 'b' | 'c'>());

// console.log(typeOf<'a' | 'b' | string>());

type U = "a" | "b" | "c";

type W<T> = "a" | "b" | "c" | T;

// console.log(typeOf<U>());

// console.log(typeOf<W<string>>());

enum E {
  a = 1,
  b = "b",
}

enum E2 {
  a = "a",
  b = "b",
}

// console.log((typeOf<E>() as TypeEnum).indexType);

// console.log((typeOf<E2>() as TypeEnum).indexType);

// console.log(unwrapTypeSchema(typeOf<E>()));

// console.log(unwrapTypeSchema(typeOf<E2>()));

// console.log(unwrapTypeSchema(typeOf<U>()));

// console.log(unwrapTypeSchema(typeOf<"a" | "b" | "c">()));

console.log(unwrapTypeSchema(typeOf<W<"d">>()));

type ActionOne = {
  type: "one";
  arg1: number;
};

type ActionTwo = {
  type: "two";
  arg2: string;
};

type Action = ActionOne | ActionTwo;

console.log(typeOf<Action>());

console.log(unwrapTypeSchema(typeOf<ActionOne | ActionTwo>()));

