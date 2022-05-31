type Format<Name extends string> = { __meta?: ["openapi", "format", Name] };

type Default<Value extends string | number | (() => any)> = {
  __meta?: ["openapi", "default", Value];
};

type Description<Text extends string> = {
  __meta?: ["openapi", "description", Text];
};

type Deprecated = {
  __meta?: ["openapi", "deprecated", Text];
};

type Name<Text extends string> = { __meta?: ["openapi", "name", Text] };

