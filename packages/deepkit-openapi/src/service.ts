import {
  HttpRouteFilter,
  HttpRouterFilterResolver
} from "@deepkit/http";
import { ScopedLogger } from "@deepkit/logger";
import { OpenAPIDocument } from "deepkit-openapi-core";
import { OpenAPIConfig } from "./module.config";


export class OpenAPIService {
  constructor(
    private routerFilter: HttpRouteFilter,
    protected filterResolver: HttpRouterFilterResolver,
    private logger: ScopedLogger,
    private config: OpenAPIConfig
  ) {}

  serialize() {
    const routes = this.filterResolver.resolve(this.routerFilter.model);
    const openApiDocument = new OpenAPIDocument(routes, this.logger, this.config);
    const result = openApiDocument.serializeDocument();

    return result;
  }
}
