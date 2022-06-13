import { HttpRouteFilter } from "@deepkit/http";
import { OpenAPI } from "deepkit-openapi-core";

export class OpenAPIConfig {
  title: string = "OpenAPI";
  description: string = "";
  version: string = "1.0.0";
  // Prefix for all OpenAPI related controllers
  prefix: string = "/openapi/";
}
