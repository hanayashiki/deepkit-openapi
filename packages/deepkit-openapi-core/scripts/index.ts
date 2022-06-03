import { typeOf, MinLength, TypedArray, reflect } from "@deepkit/type";
import { unwrapTypeSchema } from "../src/TypeSchemaResolver";
import { stringify } from "yaml";
import { SchemaRegistry } from "../src/SchemaRegistry";
import { HttpQueries } from "@deepkit/http";

console.log(typeOf<'a' | 'b' | 'c'>());

console.log(typeOf<'a' | 'b' | 'c'>());

console.log(typeOf<'a' | 'b' | string>());

type U = 'a' | 'b' | 'c';

type W<T> = 'a' | 'b' | 'c' | T;

console.log(typeOf<U>());

console.log(typeOf<W<string>>());

enum E {
  a = 1,
  b = 'b',
}

enum E2 {
  a = 'a',
  b = 'b',
}


console.log(typeOf<E>());

console.log(unwrapTypeSchema(typeOf<E>()));

console.log(unwrapTypeSchema(typeOf<E2>()));