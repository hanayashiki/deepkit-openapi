![deepkit-openapi](https://img.shields.io/badge/-deepkit--openapi-green) ![npm](https://img.shields.io/npm/v/deepkit-openapi) ![deepkit-openapi](https://img.shields.io/badge/-deepkit--openapi--core-darkgreen) ![npm](https://img.shields.io/npm/v/deepkit-openapi-core) ![ts](https://img.shields.io/badge/-typescript-%20%233078c6) ![deepkit](https://img.shields.io/badge/-deepkit-black)
# Deepkit OpenAPI

<br />

<p align="center">
    <img src="packages/docs/logo.svg" />
</p>

<p align="center">
    <i>from types, to types</i>
</p>



## Introduction

:warning: THIS LIBRARY IS UNDER 1.0.0 :warning:

This is a [Deepkit Framework](https://deepkit.io/framework) module for automatically generating [OpenAPI V3](https://swagger.io/specification/) definitions.

If you wonder what Deepkit is, it is a TypeScript framework that adds [reflection](https://en.wikipedia.org/wiki/Reflective_programming) functionalities to the already great TS language. With Deepkit, the user exploits the richness of TypeScript syntax to define solid API interface, painless validation and runtime self checks. Learn more at its [official site](https://deepkit.io/framework).

OpenAPI, on the other hand, is a popular schema for HTTP API definitions. There are countless serverside frameworks supporting it, like Java Spring, Django, FastAPI and NestJS, to name a few. However, it is Deepkit who has the potential to map code to OpenAPI definition with the least repeated code. Deepkit provides the ability to have TypeScript's static types in runtime, therefore no more decorators like `@ApiProperty` are needed. Also, Deepkit inherits the rich and rigid type system of TypeScript, with a battle-tested type checker `tsc` and the wide typed JavaScript ecosystem, so it should provide more type safety than Python 3.5+.

## Get Started

### Install Deepkit Openapi

npm

```bash
npm install deepkit-openapi
```

yarn

```bash
yarn add deepkit-openapi
```

pnpm

```bash
pnpm add deepkit-openapi
```

### Import OpenAPIModule 

```ts
import { FrameworkModule } from "@deepkit/framework";
import { OpenAPIModule } from "deepkit-openapi";

// ...

@http.controller()
class UserController {
  // ...
}

new App({
  providers: [UserController],
  controllers: [UserController],
  imports: [
    new OpenAPIModule({ prefix: "/openapi/" }),  // Import the module here
    new FrameworkModule({
      publicDir: "public",
      httpLog: true,
      migrateOnStartup: true,
    }),
  ],
})
  .loadConfigFromEnv()
  .run();

```

### Start the Application

```bash
ts-node app.ts server:start

2022-06-04T15:14:57.744Z [LOG] Start server ...
2022-06-04T15:14:57.747Z [LOG] 4 HTTP routes
2022-06-04T15:14:57.747Z [LOG] HTTP Controller UserController
2022-06-04T15:14:57.747Z [LOG]   GET /user/:id
2022-06-04T15:14:57.747Z [LOG]   POST /user/
2022-06-04T15:14:57.747Z [LOG]   PATCH /user/:id
2022-06-04T15:14:57.747Z [LOG]   DELETE /user/:id
2022-06-04T15:14:57.747Z [LOG] HTTP listening at http://0.0.0.0:8080
2022-06-04T15:14:57.747Z [LOG] Server started.
```

Visit http://localhost:8080/openapi/index.html

![](packages/docs/2022-06-05-00-21-04.png)

Now you get your OpenAPI documentation up and running with a single line of code! No annotations needed!

```ts
new OpenAPIModule({ prefix: "/openapi/" })
```

## Tutorial

### Introducing OpenAPIModule

To use `deepkit-openapi`, first we need to import `OpenAPIModule` from `deepkit-openapi`. `OpenAPIModule` is an `AppModule` that works like a custom [deepkit module](https://deepkit.io/documentation/framework/modules).

```ts
import { OpenAPIModule } from "deepkit-openapi";
```

To make this module effective, add it to your `App`'s import:

```ts
new App({
    imports: [
        new OpenAPIModule(),
        new FrameworkModule(),
    ],
}).run();
```

The `OpenAPIModule` does two things:

1. Serve `openapi.yml`, `openapi.json` under the root path, by default `/openapi`. When the query comes, it builds the OpenAPI document on the fly, according to current working HTTP controllers.
2. Serve the Swagger UI static site at `index.html`, which loads the `openapi.yml`.
   
Basically, `OpenAPiModule` builds the OpenAPI document lazily, according to the running controllers. Furthur works should be allowing the user to cache the generated document. It also serves Swagger UI, which includes exactly the files of `swagger-ui-dist`, for your convenience. You can use your own OpenAPI loader, of course.

To customize `OpenAPIModule`, provide a `OpenAPIConfig` as the parameter of `new OpenAPIModule()`. You can provide your own values optionally to it, allowing you to customize its functions.

```ts
import { OpenAPIModule, OpenAPIConfig } from 'deepkit-openapi';

new OpenAPIModule({
  title: 'The title of your APIs', // default "OpenAPI"
  description: 'The description of your APIs', // default ""
  version: 'x.y.z', // The version of your APIs. default "1.0.0"
  prefix: '/url-prefix', // The prefix of all OpenAPIModule controllers.
});
```

To further configure `OpenAPIModule`, call the following chainable methods of `OpenAPIModule`:

```ts
configureOpenApi(c: (openApi: OpenAPI) => void): OpenAPIModule
```

Manipulate the OpenAPI document after it is generated. You can mutate the document in any way you like, especially for those functions currently we don't support.

```ts
configureHttpRouteFilter(c: (filter: HttpRouteFilter) => void): OpenAPIModule
```

Configure the `HttpRouteFilter` you are using, which allows you to include or exclude any paths you want. View its type to learn how to use it.

### Define controllers

In most cases, `deepkit-openapi` just works for your existing project. However, there are limitations of `deepkit` and `deepkit-openapi` that limit your way of writing codes.  

You need to define your controllers using `@http.controller()` and `@http.GET` or `@http.<METHOD>`.

```ts
@http.controller()
class UserController {
  @http.GET("/user/:id").response<ReadUser>(200, "Read a User by its ID")
  read(id: number) {
    return db.find((user) => user.id === id);
  }
}
```

The code above maps to the following OpenAPI:

```yml
# ...
paths:
  "/user/{id}":
    get:
      tags:
        - user
      operationId: getUserRead
      parameters:
        - in: path
          name: id
          schema:
            type: number
          required: true
      responses:
        "200":
          description: Read a User by its ID
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadUser"
components:
  schemas:
    ReadUser:
      type: object
      properties:
        id:
          type: number
        name:
          type: string
        email:
          type: string
      required:
        - id
        - name
        - email
```

Please pay attention to how each part of the controller correponds to the generated document:

1. You need to specify the return type in `response` decorator. In fact, you can also specify it by explictly marking the return type. However, the `response` has higher priority, since if both exist, the returning value will be converted to the type in the decorator. Note that this typing is by-nature unsafe because any errors could return other than your given response.
2. The parameters in query, body and path are automatically documented. `HttpQueries` are supported so you can reuse grouped queries. Currently, there are no ways to document header parameters.
3. The HTTP method name, controller name and handler method name makes up the `operationId`.
4. All interfaces or classes used in the schema will be kept and reused in `components.schemas`. You are responsible for keeping their names unique. The name is generated based on the type name and its concrete type arguments.
5. Since deepkit doesn't type the `content-type` yet, we *do not* support response and request types other than `application/json`.

### Supported types

The following types are supported:

1. never
2. any
3. unknown
4. void
5. object (arbitary objects)
6. string
7. number
8. boolean
9. bigint
10. null
11. undefined
12. literal
    1.  basic literals are mapped to single-valued enums.
13. template literal
    1.  just mapped to string
14. class and interface
15. array
16. enum
17. union
    
Types not supported yet:
1. Special types that are mapped to basic types by `serializer`, like `Date`.

Types *not* planned to support:
1. Generic types
2. Intersection types. Use inheritance instead.
3. Regex
4. Functions
5. Other types that make no sense once serialized.

### Write types in a deepkit-friendly way

With deepkit, you can enjoy the simplicity of manipulating your types for validation:

For example, you have a `User`, now you want `CreateUser` for user sign up, and `ReadUser` for reading users. In a simple settings, we have following types that work well with plain deepkit.

```ts
interface User {
  id: number;
  name: string;
  password: string;
}

type ReadUser = Omit<User, 'password'>;

type CreateUser = Omit<User, 'id'>;
```

However, this doesn't work for `openapi-deepkit` if you define the following controllers:

```ts
  @http.GET("/user/:id").response<ReadUser>(200, "Read a User by its ID")
  read(id: number) {
    // return ...;
  }

  @http.POST("/user/").response<ReadUser>(200, "Create a User")
  create(user: HttpBody<CreateUser>) {
    // return ...;
  }
```

It will not generate a normal body name for `create` method, becasue the name `CreateUser` is "forgotten" by deepkit. You will get a bare interface as this:

```ts
interface User {
  name: string;
  password: string;
}
```

The problem here is, `deepkit-openapi` will generate two schemas different in type but with the same name `User`. We need the user to provide us the name of the type to generate human-readable OpenAPI documentations.

The workaround would be:

```ts
interface User {
  id: number;
  name: string;
  password: string;
}

interface ReadUser extends Omit<User, 'password'> {};

interface CreateUser extends Omit<User, 'id'> {};
```

They are further resolved to, from the perspective of `deepkit`:

```ts
interface User {
  id: number;
  name: string;
  password: string;
}

interface ReadUser {
  id: number;
  name: string;
}

interface CreateUser {
  name: string;
  password: string;
}
```

Now, the names will be sufficient for `deepkit-openapi`.

## Contributing

Thank you for reading! If you want to contribute to this project, take a look at [DEVELOPMENT.md](DEVELOPMENT.md). This is a monorepo project based on yarn@1 and deepkit's compiler. Note that deepkit and the deepkit community is still young, and any changes might break this library. Use it and devote yourself at your own risk!