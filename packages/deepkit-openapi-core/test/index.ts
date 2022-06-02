import { typeOf, MinLength, TypedArray, reflect } from "@deepkit/type";
import { unwrapTypeSchema } from "../src/TypeSchemaResolver";
import { stringify } from "yaml";
import { SchemaRegistry } from "../src/SchemaRegistry";
import { HttpQueries } from "@deepkit/http";
interface I {
  a: number;
}

type T = {
  b: number;
};

class C {
  c!: number;
}

class D extends C {
  d!: string;
  c!: number & MinLength<5>;
  e?: C;
}

console.log(stringify(unwrapTypeSchema(typeOf<D>())));

enum Enum {
  a = 1,
  b = "b",
  c = "c",
}

// console.log(typeOf<Enum>());

type Union = "a" | "b" | "c";

type UnionAlias = Union;

// console.log(typeOf<UnionAlias>());

// console.log(typeOf<"a" | "b" | "c">());

type Paginated<T> = {
  items: T[];
};

type PaginatedItems = {
  items: (string & MinLength<5>)[];
  fuck: () => string;
}

console.log(typeOf<HttpQueries<{ number: 1 }>>());
