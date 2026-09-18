import { stringify } from 'yaml'
export const stringifyYaml = (x: unknown) => {
  return stringify(x, { lineWidth: 0, singleQuote: true, nullStr: '' })
}
