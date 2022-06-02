import { HttpRouteFilter, HttpRouterFilterResolver } from '@deepkit/http';
import { OpenAPIDocument } from 'deepkit-openapi-core';

export class OpenAPIService {
  constructor(
    private routerFilter: HttpRouteFilter,
    protected filterResolver: HttpRouterFilterResolver,
  ) {}

  serialize() {
    const routes = this.filterResolver.resolve(this.routerFilter.model);
    const openApiDocument = new OpenAPIDocument(routes);
    return openApiDocument.serializeDocument();
  }
}