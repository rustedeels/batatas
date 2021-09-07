import { exists } from 'https://deno.land/std@0.105.0/fs/mod.ts';
import { parse } from 'https://deno.land/std@0.106.0/path/mod.ts';

import {
  EnumFile,
  OutputPack,
  SourcePack,
} from './neo-parser.model.ts';
import {
  toPascalCase,
  toSnakeCase,
} from './neo-parser.tools.ts';

export async function readOutputFiles(s: SourcePack): Promise<OutputPack> {
  return {
    name: s.name,
    package: s.package,
    sources: s.src,
    resources: {
      enum: toPascalCase(s.name) + 'Resources',
      export: `${toSnakeCase(s.name).toUpperCase()}_RESOURCES`,
      items: [],
      path: s.resList,
    },
    resEnum: await readEnumFile(s.resNames, s.name, 'enum'),
    resMap: await readEnumFile(s.resMap, s.name, 'map'),
    charMap: await readEnumFile(s.charMap, s.name, 'map'),
  }
}

async function readEnumFile(path: string, name: string, type: 'enum' | 'map'): Promise<EnumFile> {
  if (!await exists(path)) return buildDefaultEnumFile(path, name, type);

  const content = await Deno.readTextFile(path);
  const [header, enums] = splitEnumFile(content);
  
  const regExp = type === 'enum' ? /^\s*(\w*)\s*=\s*'(.*)'/gm : /^\s*(\w*)\s*:\s*(.*?),?$/gm;
  const items = parseKeyValues(enums, regExp);

  return {
    header,
    path,
    items,
    export: buildExportName(path, name, type),
  }
}

function buildExportName(path: string, name: string, type: 'enum' | 'map'): string {
  if (type === 'enum') return toPascalCase(name) + 'Resources';

  if (parse(path).name.indexOf('res') === 0)
    return `${toSnakeCase(name).toUpperCase()}_RES_MAP`;
  if (parse(path).name.indexOf('char') === 0)
    return `${toSnakeCase(name).toUpperCase()}_CHAR_MAP`;

  return `${toSnakeCase(name).toUpperCase()}_MAP`;
}

function buildDefaultEnumFile(path: string, name: string, type: 'enum' | 'map'): EnumFile {
  return {
    export: buildExportName(path, name, type),
    items: new Map<string, string>(),
    path,
    header: '',
  }
}

function splitEnumFile(src: string): [header: string, enums: string] {
  const index = src.lastIndexOf('export ');
  if (index === -1) return ['', ''];

  return [src.substring(0, index), src.substring(index)];
}

function parseKeyValues(src: string, exp: RegExp): Map<string, string> {
  const items = new Map<string, string>();
  const matches = src.matchAll(exp);
  for (const match of matches) {
    items.set(match[1], match[2]);
  }
  return items;
}
