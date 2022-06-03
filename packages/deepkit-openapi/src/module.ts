import { createModule, findParentPath } from "@deepkit/app";
import {
  HttpRequest,
  HttpResponse,
  HttpRouteFilter,
  normalizeDirectory,
  serveStaticListener,
  httpWorkflow,
  RouteConfig,
} from "@deepkit/http";
import { urlJoin } from "@deepkit/core";
import { OpenAPIConfig } from "./module.config";
import { OpenAPIService } from "./service";
import { join, dirname } from "path";
import { stringify } from "yaml";
import { eventDispatcher } from "@deepkit/event";
import send from "send";
import { stat } from "fs/promises";

export class OpenAPIModule extends createModule({
  config: OpenAPIConfig,
  providers: [OpenAPIService],
  exports: [OpenAPIService],
}) {
  protected routeFilter = new HttpRouteFilter().excludeRoutes({
    group: "app-static",
  });

  process() {
    this.addProvider({ provide: HttpRouteFilter, useValue: this.routeFilter });

    const module = this;

    // Need to overwrite some static files provided by swagger-ui-dist
    class OpenApiStaticRewritingListener {
      constructor(
        private openApi: OpenAPIService,
        private config: OpenAPIConfig,
      ) {}

      get staticDirectory() {
        return dirname(require.resolve("swagger-ui-dist"));
      }

      get prefix() {
        return normalizeDirectory(this.config.prefix);
      }

      get swaggerInitializer() {
        return `
          window.onload = function() {
            window.ui = SwaggerUIBundle({
              url: ${JSON.stringify(this.prefix + "openapi.yml")},
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout"
            });
    
          };
        `;
      }

      serve(path: string, request: HttpRequest, response: HttpResponse) {
        if (path.endsWith("/swagger-initializer.js")) {
          response.setHeader(
            "content-type",
            "application/javascript; charset=utf-8",
          );
          response.end(this.swaggerInitializer);
        } else if (path.endsWith("/openapi.json")) {
          const s = JSON.stringify(this.openApi.serialize(), undefined, 2);
          response.setHeader("content-type", "application/json; charset=utf-8");
          response.end(s);
        } else if (
          path.endsWith("/openapi.yaml") ||
          path.endsWith("/openapi.yml")
        ) {
          const s = stringify(this.openApi.serialize(), {
            aliasDuplicateObjects: false,
          });
          response.setHeader("content-type", "text/yaml; charset=utf-8");
          response.end(s);
        } else {
          return new Promise(async (resolve, reject) => {
            const relativePath = urlJoin(
              "/",
              request.url!.substring(this.prefix.length),
            );
            const finalLocalPath = join(this.staticDirectory, relativePath);

            const statResult = await stat(finalLocalPath);
            if (statResult.isFile()) {
              const res = send(request, path, { root: this.staticDirectory });
              res.pipe(response);
              res.on("end", resolve);
            } else {
              response.write(`The static path ${request.url} is not found.`);
              response.status(404);
            }
          });
        }
      }

      @eventDispatcher.listen(httpWorkflow.onRoute, 101)
      onRoute(event: typeof httpWorkflow.onRoute.event) {
        if (event.sent) return;
        if (event.route) return;

        if (!event.request.url?.startsWith(this.prefix)) return;

        const relativePath = urlJoin(
          "/",
          event.url.substring(this.prefix.length),
        );

        event.routeFound(
          new RouteConfig("static", ["GET"], event.url, {
            controller: OpenApiStaticRewritingListener,
            module,
            methodName: "serve",
          }),
          () => [relativePath, event.request, event.response],
        );
      }
    }

    this.addListener(OpenApiStaticRewritingListener);
  }
}
