import { parse } from 'https://deno.land/std@0.106.0/path/mod.ts';
import * as CONVERT from 'https://dev.jspm.io/js-convert-case';

import { OutputPack } from './neo-parser.model.ts';

export const toCamelCase = (CONVERT.default as { toCamelCase: (s: string) => string})['toCamelCase'];
export const toPascalCase = (CONVERT.default as { toPascalCase: (s: string) => string})['toPascalCase'];
export const toSnakeCase = (CONVERT.default as { toSnakeCase: (s: string) => string})['toSnakeCase'];

export function ensureId(id: string, pack: OutputPack): void {
  if (pack.resEnum.items.has(id)) return;
  pack.resEnum.items.set(id, crypto.randomUUID());
}

export function buildResId(path: string): string {
  const name = parse(path).name;
  return toCamelCase(name);
}

export function toUnixPath(path: string): string {
  return path.replace(/\\/g, '/');
}
