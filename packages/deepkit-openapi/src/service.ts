import {
  HttpRouteFilter,
  HttpRouterFilterResolver
} from "@deepkit/http";
import { ScopedLogger } from "@deepkit/logger";
import { OpenAPIDocument } from "deepkit-openapi-core";


export class OpenAPIService {
  constructor(
    private routerFilter: HttpRouteFilter,
    protected filterResolver: HttpRouterFilterResolver,
    private logger: ScopedLogger
  ) {}

  serialize() {
    const routes = this.filterResolver.resolve(this.routerFilter.model);
    const openApiDocument = new OpenAPIDocument(routes, this.logger);
    const result = openApiDocument.serializeDocument();

    return result;
  }
}
