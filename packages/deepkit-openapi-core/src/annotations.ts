export type Format<Name extends string> = { __meta?: ["openapi", "format", Name] };

export type Default<Value extends string | number | (() => any)> = {
  __meta?: ["openapi", "default", Value];
};

export type Description<Text extends string> = {
  __meta?: ["openapi", "description", Text];
};

export type Deprecated = {
  __meta?: ["openapi", "deprecated", Text];
};

export type Name<Text extends string> = { __meta?: ["openapi", "name", Text] };

