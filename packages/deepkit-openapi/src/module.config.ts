import { OpenAPICoreConfig } from "deepkit-openapi-core";

export class OpenAPIConfig extends OpenAPICoreConfig {
  title: string = "OpenAPI";
  description: string = "";
  version: string = "1.0.0";
  // Prefix for all OpenAPI related controllers
  prefix: string = "/openapi/";
}
