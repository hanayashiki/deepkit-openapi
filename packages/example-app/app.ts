#!/usr/bin/env ts-node-script
import { createCrudRoutes, FrameworkModule } from "@deepkit/framework";
import { MainController } from "./src/controller/main.http";
import { Config } from "./src/config";
import { JSONTransport, Logger } from "@deepkit/logger";
import { App } from "@deepkit/app";
import { OpenAPIModule } from "deepkit-openapi";

new App({
  config: Config,
  providers: [MainController],
  controllers: [MainController],
  imports: [
    new OpenAPIModule({ prefix: '/openapi/' }),
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
      module.setupProvider<Logger>().setTransport([new JSONTransport()]);
    }
  })
  .loadConfigFromEnv()
  .run();
