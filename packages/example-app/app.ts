#!/usr/bin/env ts-node-script
import { http, HttpBody, HttpError } from "@deepkit/http";

import { FrameworkModule } from "@deepkit/framework";
import { JSONTransport, Logger } from "@deepkit/logger";
import { App } from "@deepkit/app";
import { OpenAPIModule, Name } from "deepkit-openapi";
import { Email, MaxLength, metaAnnotation, typeOf, validationAnnotation } from "@deepkit/type";
import { MainController } from "./src/controller/main.http";
import { Config } from "./src/config";

type User = {
  id: number;
  name: string;
  email: string & Email;
  password: string;
};

type CreateUser = Omit<User, "id">;

type UpdateUser = Partial<User> & Name<'UpdateUser'>;

type ReadUser = Omit<User, "password"> & Name<'ReadUser'>;;

const db: User[] = [
  { id: 1, name: "Bob", email: "bob@gmail.com", password: "123" },
  { id: 2, name: "Alice", email: "alice@gmail.com", password: "123" },
];

@http.controller()
class UserController {
  @(http.GET("/user/:id").response<ReadUser>(200, "Read a User by its ID"))
  read(id: number) {
    return db.find((user) => user.id === id);
  }

  @(http.POST("/user").response<ReadUser>(200, "Create a User"))
  create(user: HttpBody<CreateUser>) {
    const newUser = { ...user, id: Date.now() };
    db.push(newUser);
    return user;
  }

  @(http.PATCH("/user/:id").response<ReadUser>(200, "Patch a User's attributes"))
  patch(id: number, patch: HttpBody<UpdateUser>) {
    const user = db.find((user) => user.id === id);

    if (user) {
      Object.assign(user, patch);
    }

    return user;
  }

  @(http.DELETE("/user/:id").response<ReadUser>(200, "Delete a User by its ID"))
  delete(id: number) {
    const index = db.findIndex((user) => user.id === id);

    if (index !== -1) {
      const user = db[index];
      db.splice(index, 1);
      return user;
    }

    throw new HttpError('User not found', 404);
  }
}

new App({
  config: Config,
  providers: [UserController, MainController],
  controllers: [UserController, MainController],
  imports: [
    new OpenAPIModule({ prefix: "/openapi/" }),
    new FrameworkModule({
      publicDir: "public",
      httpLog: true,
      migrateOnStartup: true,
    }),
  ],
})
  .setup((module, config) => {
    if (config.environment === "development") {
      module
        .getImportedModuleByClass(FrameworkModule)
        .configure({ debug: true });
    }

    if (config.environment === "production") {
      //enable logging JSON messages instead of formatted strings
      module.configureProvider<Logger>(p => p.setTransport([new JSONTransport()]));
    }
  })
  .loadConfigFromEnv()
  .run();
