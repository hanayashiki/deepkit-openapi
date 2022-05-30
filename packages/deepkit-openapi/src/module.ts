import { createModule, findParentPath } from "@deepkit/app";
import { FrameworkModule } from "@deepkit/framework";
import { HttpRouteFilter } from "@deepkit/http";
import { OpenAPIService } from "./service";

export class OpenAPIModule extends createModule({
  providers: [OpenAPIService],
  exports: [OpenAPIService],
}) {
  protected routeFilter = new HttpRouteFilter().excludeRoutes({
    group: "app-static",
  });

  process() {
    this.addProvider({ provide: HttpRouteFilter, useValue: this.routeFilter });
  }
}
