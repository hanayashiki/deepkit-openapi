import { HttpRouteFilter, HttpRouterFilterResolver, normalizeDirectory } from '@deepkit/http';
import { OpenAPIDocument } from 'deepkit-openapi-core';
import { OpenAPIConfig } from './module.config';

export class OpenAPIService {
  constructor(
    private config: OpenAPIConfig,
    private routerFilter: HttpRouteFilter,
    protected filterResolver: HttpRouterFilterResolver,
  ) {}

  serialize() {
    const routes = this.filterResolver.resolve(this.routerFilter.model);
    const openApiDocument = new OpenAPIDocument(routes);
    const result = openApiDocument.serializeDocument();
    // console.log('errors', openApiDocument.errors);
    return result;
  }
}