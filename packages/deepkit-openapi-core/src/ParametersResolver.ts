import { ReflectionKind } from "@deepkit/type";
import { DeepKitOpenApiError, DeepKitTypeError } from "./errors";
import { SchemaRegistry } from "./SchemaRegistry";
import { Parameter, ParsedRoute, RequestBody } from "./types";
import { resolveTypeSchema } from "./TypeSchemaResolver";

export class ParametersResolver {
  parameters: Parameter[] = [];
  requestBody?: RequestBody;
  errors: DeepKitTypeError[] = [];

  constructor(
    private parsedRoute: ParsedRoute,
    private schemeRegistry: SchemaRegistry,
  ) {}

  resolve() {
    for (const parameter of this.parsedRoute.getParameters()) {
      const type = parameter.getType();

      if (parameter.query) {
        const schemaResult = resolveTypeSchema(type, this.schemeRegistry);

        this.errors.push(...schemaResult.errors);

        this.parameters.push({
          in: "query",
          name: parameter.getName(),
          schema: schemaResult.result,
          required: !parameter.parameter.isOptional(),
        });
      } else if (parameter.queries) {
        if (
          type.kind !== ReflectionKind.class &&
          type.kind !== ReflectionKind.objectLiteral
        ) {
          throw new DeepKitOpenApiError(
            "HttpQueries should be either class or object literal. ",
          );
        }

        const schemaResult = resolveTypeSchema(type, this.schemeRegistry);

        this.errors.push(...schemaResult.errors);

        for (const [key, property] of Object.entries(
          schemaResult.result.properties!,
        )) {
          this.parameters.push({
            in: "query",
            name: key,
            schema: property,
            required: schemaResult.result.required?.includes(key),
          });
        }
      } else if (parameter.isPartOfPath()) {
        const schemaResult = resolveTypeSchema(type, this.schemeRegistry);

        this.errors.push(...schemaResult.errors);

        this.parameters.push({
          in: "path",
          name: parameter.getName(),
          schema: schemaResult.result,
          required: true,
        });
      } else if (parameter.body || parameter.bodyValidation) {
        if (
          type.kind !== ReflectionKind.class &&
          type.kind !== ReflectionKind.objectLiteral
        ) {
          throw new DeepKitOpenApiError(
            "HttpBody or HttpBodyValidation should be either class or object literal. ",
          );
        }
        console.log(type);
        const bodySchema = resolveTypeSchema(type, this.schemeRegistry);

        this.errors.push(...bodySchema.errors);

        this.requestBody = {
          content: {
            "application/json": { schema: bodySchema.result },
            "application/x-www-form-urlencoded": { schema: bodySchema.result },
            "multipart/form-data": { schema: bodySchema.result },
          },
          required: !parameter.parameter.isOptional(),
        };
      }
    }

    return this;
  }
}
