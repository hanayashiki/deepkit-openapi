export const resolveOpenApiPath = (deepkitPath: string) => {
  return deepkitPath.replace(/:(\w+)/g, (_, name) => `\{${name}\}`)
};