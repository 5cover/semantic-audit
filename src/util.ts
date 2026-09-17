import YAML from 'yaml'
export const stringifyYaml = (x: unknown) => {
  return YAML.stringify(x, { lineWidth: 0, singleQuote: true, nullStr: '' })
}
