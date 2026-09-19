import { intern } from 'interner'
import { stringify } from 'yaml'
export const stringifyYaml = (x: unknown) => {
  return stringify(intern(x), { lineWidth: 0, singleQuote: true, nullStr: '' })
}
