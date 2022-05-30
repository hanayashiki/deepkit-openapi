import { ReflectionClass, typeOf, ReflectionKind } from '@deepkit/type';

interface I {
  a: number
}

type T = {
  b: number
}

class C {
  c!: number;
}

console.log(typeOf<I>())
console.log(typeOf<T>())
console.log(typeOf<C>())