import { ClassType } from "@deepkit/core";
import { parseRouteControllerAction, RouteClassControllerAction, RouteConfig } from "@deepkit/http";
import camelcase from "camelcase";
import {
  DeepKitOpenApiControllerNameConflict,
  DeepKitOpenApiOperationNameConflict,
  DeepKitTypeError,
} from "./errors";
import { ParametersResolver } from "./ParametersResolver";
import { SchemaKeyFn, SchemaRegistry } from "./SchemaRegistry";
import {
  Schema,
  HttpMethod,
  OpenAPI,
  OpenAPIResponse,
  Operation,
  ParsedRoute,
  Tag,
  Responses,
  RequestMediaTypeName,
} from "./types";
import cloneDeepWith from "lodash.clonedeepwith";
import { resolveOpenApiPath } from "./utils";
import { resolveTypeSchema } from "./TypeSchemaResolver";
import { ReflectionKind } from "@deepkit/type";
import { ScopedLogger } from "@deepkit/logger";

export class OpenAPICoreConfig {
  customSchemaKeyFn?: SchemaKeyFn;
  contentTypes?: RequestMediaTypeName[];
}

export class OpenAPIDocument {
  schemaRegistry = new SchemaRegistry(this.config.customSchemaKeyFn);

  operations: Operation[] = [];

  tags: Tag[] = [];

  errors: DeepKitTypeError[] = [];

  constructor(private routes: RouteConfig[], private log: ScopedLogger, private config: OpenAPICoreConfig = {}) {}

  getControllerName(controller: ClassType) {
    // TODO: Allow customized name
    return camelcase(controller.name.replace(/Controller$/, ""));
  }

  registerTag(controller: ClassType) {
    const name = this.getControllerName(controller);
    const newTag = {
      __controller: controller,
      name,
    };
    const currentTag = this.tags.find((tag) => tag.name === name);
    if (currentTag) {
      if (currentTag.__controller !== controller) {
        throw new DeepKitOpenApiControllerNameConflict(
          controller,
          currentTag.__controller,
          name,
        );
      }
    } else {
      this.tags.push(newTag);
    }

    return newTag;
  }

  getDocument(): OpenAPI {
    for (const route of this.routes) {
      this.registerRouteSafe(route);
    }

    const openapi: OpenAPI = {
      openapi: "3.0.3",
      info: {
        title: "OpenAPI",
        contact: {},
        license: { name: "MIT" },
        version: "0.0.1",
      },
      servers: [],
      paths: {},
      components: {},
    };

    for (const operation of this.operations) {
      const openApiPath = resolveOpenApiPath(operation.__path);

      if (!openapi.paths[openApiPath]) {
        openapi.paths[openApiPath] = {};
      }
      openapi.paths[openApiPath][operation.__method as HttpMethod] = operation;
    }

    for (const [key, schema] of this.schemaRegistry.store) {
      openapi.components.schemas = openapi.components.schemas ?? {};
      openapi.components.schemas[key] = {
        ...schema.schema,
        __isComponent: true,
      };
    }

    return openapi;
  }

  serializeDocument(): OpenAPI {
    return cloneDeepWith(this.getDocument(), (c) => {
      if (c && typeof c === "object") {
        if (c.__type === "schema" && c.__registryKey && !c.__isComponent) {
          const ret = {
            $ref: `#/components/schemas/${c.__registryKey}`,
          };

          if (c.nullable) {
            return {
              nullable: true,
              allOf: [ret],
            };
          }

          return ret;
        }

        for (const key of Object.keys(c)) {
          // Remove internal keys.
          if (key.startsWith("__")) delete c[key];
        }
      }
    });
  }

  registerRouteSafe(route: RouteConfig) {
    try {
      this.registerRoute(route);
    } catch (err: any) {
      this.log.error(`Failed to register route ${route.httpMethods.join(',')} ${route.getFullPath()}`, err);
    }
  }

  registerRoute(route: RouteConfig) {
    if (route.action.type !== 'controller') {
      throw new Error('Sorry, only controller routes are currently supported!');
    }

    const controller = route.action.controller;
    const tag = this.registerTag(controller);
    const parsedRoute = parseRouteControllerAction(route);

    for (const method of route.httpMethods) {
      const parametersResolver = new ParametersResolver(
        parsedRoute,
        this.schemaRegistry,
        this.config.contentTypes
      ).resolve();
      this.errors.push(...parametersResolver.errors);

      const responses = this.resolveResponses(route);

      if (route.action.type !== 'controller') {
        throw new Error('Sorry, only controller routes are currently supported!');
      }

      const slash = route.path.length === 0 || route.path.startsWith('/') ? '' : '/';

      const operation: Operation = {
        __path: `${route.baseUrl}${slash}${route.path}`,
        __method: method.toLowerCase(),
        tags: [tag.name],
        operationId: camelcase([method, tag.name, route.action.methodName]),
        parameters:
          parametersResolver.parameters.length > 0
            ? parametersResolver.parameters
            : undefined,
        requestBody: parametersResolver.requestBody,
        responses,
      };

      if (
        this.operations.find(
          (p) => p.__path === operation.__path && p.__method === operation.__method,
        )
      ) {
        throw new DeepKitOpenApiOperationNameConflict(
          operation.__path,
          operation.__method,
        );
      }

      this.operations.push(operation);
    }
  }

  resolveResponses(route: RouteConfig) {
    const responses: Responses = {};

    // First get the response type of the method
    if (route.returnType) {
      const schemaResult = resolveTypeSchema(
        route.returnType.kind === ReflectionKind.promise
          ? route.returnType.type
          : route.returnType,
        this.schemaRegistry,
      );

      this.errors.push(...schemaResult.errors);

      responses[200] = {
        description: "",
        content: {
          "application/json": {
            schema: schemaResult.result,
          },
        },
      };
    }

    // Annotated responses have higher priority
    for (const response of route.responses) {
      let schema: Schema | undefined;
      if (response.type) {
        const schemaResult = resolveTypeSchema(
          response.type,
          this.schemaRegistry,
        );
        schema = schemaResult.result;
        this.errors.push(...schemaResult.errors);
      }

      if (!responses[response.statusCode]) {
        responses[response.statusCode] = {
          description: "",
          content: { "application/json": schema ? { schema } : undefined },
        };
      }

      responses[response.statusCode].description ||= response.description;
      if (schema) {
        responses[response.statusCode].content["application/json"]!.schema =
          schema;
      }
    }

    return responses;
  }
}
