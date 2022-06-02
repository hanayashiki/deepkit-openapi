import { ClassType } from "@deepkit/core";
import { parseRouteControllerAction, RouteConfig } from "@deepkit/http";
import camelcase from "camelcase";
import {
  DeepKitOpenApiControllerNameConflict,
  DeepKitOpenApiOperationNameConflict,
  DeepKitTypeError,
} from "./errors";
import { ParametersResolver } from "./ParametersResolver";
import { SchemaRegistry } from "./SchemaRegistry";
import { HttpMethod, OpenAPI, Operation, Tag } from "./types";
import cloneDeepWith from "lodash.clonedeepwith";
import { resolveOpenApiPath } from "./utils";

export class OpenAPIDocument {
  schemaRegistry = new SchemaRegistry();

  operations: Operation[] = [];

  tags: Tag[] = [];

  errors: DeepKitTypeError[] = [];

  constructor(private routes: RouteConfig[]) {}

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
      this.registerRoute(route);
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
      if (typeof c === "object") {
        if (c.__type === "schema" && c.__registryKey && !c.__isComponent) {
          return {
            $ref: `#/components/schemas/${c.__registryKey}`,
          };
        }

        for (const key of Object.keys(c)) {
          // Remove internal keys;
          if (key.startsWith("__")) delete c[key];
        }
      }
    });
  }

  registerRoute(route: RouteConfig) {
    const controller = route.action.controller;
    const tag = this.registerTag(controller);
    const parsedRoute = parseRouteControllerAction(route);

    for (const method of route.httpMethods) {
      const parametersResolver = new ParametersResolver(
        parsedRoute,
        this.schemaRegistry,
      ).resolve();
      this.errors.push(...parametersResolver.errors);

      const operation: Operation = {
        __path: `${route.baseUrl}${route.path}`,
        __method: method.toLowerCase(),
        tags: [tag.name],
        operationId: camelcase([method, tag.name, route.action.methodName]),
        parameters:
          parametersResolver.parameters.length > 0
            ? parametersResolver.parameters
            : undefined,
        requestBody: parametersResolver.requestBody,
      };

      if (
        this.operations.find(
          (p) => p.__path === operation.__path && p.__method === p.__method,
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
}
