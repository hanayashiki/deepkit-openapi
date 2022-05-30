import { HttpRouteFilter, HttpRouterFilterResolver } from '@deepkit/http';

export class OpenAPIService {
  constructor(
    private routerFilter: HttpRouteFilter,
    protected filterResolver: HttpRouterFilterResolver,
  ) {}

  getDocument() {
    const routes = this.filterResolver.resolve(this.routerFilter.model);
    console.log(routes);
    return {};
  }
}