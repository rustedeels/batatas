import { ensureDir } from 'https://deno.land/std@0.105.0/fs/mod.ts';
import { parse } from 'https://deno.land/std@0.106.0/path/mod.ts';

import {
  EnumFile,
  OutputPack,
  Resource,
  ResourceFile,
} from './neo-parser.model.ts';
import {
  toPascalCase,
  toUnixPath,
} from './neo-parser.tools.ts';

const LIB_ENGINE = `@ngx-batatas/engine`

export async function saveOutput(pack: OutputPack): Promise<void> {
  await ensureOutputExists(pack.package);

  await savePackageFile(pack);

  if (pack.resources.items.length) {
    await saveResourceEnum(pack);
    await saveResourceList(pack);
  }

  if (pack.sources.length) {
    await saveResMap(pack);
    await saveCharMap(pack);
  }
}

/** Save package file to disk */
async function savePackageFile(pack: OutputPack): Promise<void> {
  const resName = pack.resources.items.length ? pack.resources.export : '[]';
  const resMap = pack.sources.length ? pack.resMap.export : '{}';
  const charMap = pack.sources.length ? pack.charMap.export : '{}';

  const content = `${buildPackageHeader(pack)}

export const ${toPascalCase(pack.name)}Package: Package = {
  id: '${pack.name}',
  sources: ${buildSourceList(pack.sources)},
  resources: ${resName},
  resMap: ${resMap},
  charMap: ${charMap},
};
`;
  await Deno.writeTextFile(pack.package, content);
  console.log(`${pack.package} saved`);
}

/** save resource array file */
async function saveResourceList(pack: OutputPack): Promise<void> {
  const content = `${libImport(['Resource'])}
${enumImport(pack.resEnum)}

export const ${pack.resources.export}: Resource[] = [
${buildResourceList(pack)}
];
`;
  await Deno.writeTextFile(pack.resources.path, content);
  console.log(`${pack.resources.path} saved`);
}

/** save enum file with resources names */
async function saveResourceEnum(pack: OutputPack): Promise<void> {
const items = [...pack.resEnum.items].map(e => `  ${e[0]} = '${e[1]}'`).join(',\n');

  const content = `export enum ${pack.resEnum.export} {
${items}
}
`;
  await Deno.writeTextFile(pack.resEnum.path, content);
  console.log(`${pack.resEnum.path} saved`);
}

/** Save resMap */
async function saveResMap(pack: OutputPack): Promise<void> {
  const header = pack.resMap.header
    || `${libImport(['PackageMap'])}\n${enumImport(pack.resEnum)}\n`;
  const items = [...pack.resMap.items].map(e => `  ${e[0]}: ${e[1] || '\'\''},`).join('\n');

  const content = `${header}export const ${pack.resMap.export}: PackageMap = {\n${items}\n};`;
  await Deno.writeTextFile(pack.resMap.path, content);
  console.log(`${pack.resMap.path} saved`);
}



/** Save charMap */
async function saveCharMap(pack: OutputPack): Promise<void> {
  const header = pack.charMap.header || libImport(['PackageMap']) + '\n';
  const items = [...pack.charMap.items].map(e => `  ${e[0]}: ${e[1] || '\'\''},`).join('\n');

  const content = `${header}export const ${pack.charMap.export}: PackageMap = {\n${items}\n};
`;
  await Deno.writeTextFile(pack.charMap.path, content);
  console.log(`${pack.charMap.path} saved`);
}

function buildResourceList(pack: OutputPack): string {
  return pack.resources.items.map(buildResource).join('\n');
}

function buildResource(r: Resource): string {
  const tags = r.tags.map(t => `'${t}'`).join(', ');

  return `  {
    id: ${r.id},
    type: '${r.type}',
    tags: [${tags}],
    path: '${r.path}',
  },`
}

function buildSourceList(list: string[]): string {
  const listStr = list
    .map(s => `${toUnixPath(s)}`)
    .map(s => s.substring(s.indexOf('/assets')))
    .map(s => `    '${s}',`)
    .join('\n');
  return `[\n${listStr}\n  ]`;
}

function buildPackageHeader(pack: OutputPack): string {
  const importList: string[] = [libImport(['Package'])];

  if (pack.resources.items.length)
    importList.push(enumImport(pack.resources));
  if (pack.sources.length) {
    importList.push(enumImport(pack.resMap));
    importList.push(enumImport(pack.charMap));
  }

  return importList.join('\n');
}

async function ensureOutputExists(path: string): Promise<void> {
  const dirPath = parse(path).dir;
  await ensureDir(dirPath);
}

function libImport(names: string[]): string {
  return `import { ${names.join(', ')} } from '${LIB_ENGINE}';`;
}

function enumImport(e: EnumFile | ResourceFile): string {
  const relPath = parse(e.path).name;
  return `import { ${e.export} } from './${relPath}';`;
}
