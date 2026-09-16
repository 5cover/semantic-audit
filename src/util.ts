import { stringify } from 'yaml';
export const stringifyYaml = (x: unknown) => {
  return stringify(x, { aliasDuplicateObjects: true, lineWidth: 0, nullStr: '' });
};
