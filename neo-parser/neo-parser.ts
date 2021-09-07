import { parse as P } from 'https://deno.land/std@0.106.0/path/mod.ts';

import {
  RawFile,
  RawFileType,
} from '../core/parser/parser.model.ts';
import { parseSources } from '../core/parser/parser.sources.ts';
import { loadPackages } from './neo-parser.input.ts';
import {
  NeoParserOptions,
  OutputPack,
  Resource,
  ResourceType,
  SourcePack,
} from './neo-parser.model.ts';
import { saveOutput } from './neo-parser.output.ts';
import { readOutputFiles } from './neo-parser.reader.ts';
import {
  buildResId,
  ensureId,
  toUnixPath,
} from './neo-parser.tools.ts';

export async function parseProject(opt: NeoParserOptions): Promise<void> {
  const inputPack = await loadPackages(opt);
  console.log(`Found ${inputPack.length} packages`);

  for (const p of inputPack) {
    console.log('Processing package: ' + p.name);
    const outPack = await readOutputFiles(p);
    await parsePackage(p, outPack);
    await saveOutput(outPack);
    console.log('Updated package: ' + p.name);
  }
}

async function parsePackage(inPack: SourcePack, out: OutputPack): Promise<void> {
  out.resources.items = processResources(inPack.res, out);

  const rawSources: RawFile[] = inPack.src.map(getRawFile);
  const values = await parseSources(rawSources);

  const charNames = values.chapters.flatMap(x => x.party.map(y => y.name));
  for (const name of charNames) {
    if (isGeneric(name)) continue;
    if (out.charMap.items.has(name)) continue;
    out.charMap.items.set(name, '');
  }

  const resNames = [
    ...values.chapters.flatMap(x => x.media),
    ...values.chapters.flatMap(x => x.dialog.flatMap(y => y.media)),
    ...values.chapters.flatMap(x => x.dialog.flatMap(y => y.text.flatMap(z => z.media))),
    ...values.places.flatMap(x => x.media),
    ...values.markers.flatMap(x => x.media),
  ].map(e => e.name);
  for (const name of resNames) {
    if (isGeneric(name)) continue;
    if (out.resMap.items.has(name)) continue;
    out.resMap.items.set(name, '');
  }
}

function processResources(list: string[], out: OutputPack): Resource[] {
  const res: Resource[] = [];
  
  for (const path of list) {
    const unixPath = toUnixPath(path);
    const id = buildResId(path);
    ensureId(id, out);

    res.push({
      id: `${out.resEnum.export}.${id}`,
      path: unixPath.substring(unixPath.indexOf('/assets')),
      tags: P(path).base.split('.').flatMap(x => x.toLowerCase().split('_')),
      type: getResType(path),
    })
  }

  return res;
}

function getRawFile(path: string): RawFile {
  const ext = P(path).ext;
  let type: RawFileType = 'chapter';
  switch (ext) {
    case '.chapter':
      type = 'chapter';
      break;
    case '.marker':
      type = 'marker';
      break;
    case '.place':
      type = 'place';
      break;
    default: throw new Error('Unknown source file type: ' + ext);
  }

  return {
    path: path,
    type,
  };
}

function getResType(path: string): ResourceType {
  const MAP: { [key: string]: ResourceType } = {
    'back': 'background',
    'background': 'background',
    'img': 'image',
    'image': 'image',
    'portrait': 'image',
    'music': 'music',
    'sound': 'sound',
    'effect': 'sound',
    'video': 'video',
  };
  
  const prefix = P(path).name.split('.')[0] as keyof typeof MAP;
  const type = MAP[prefix];

  if (!type) {
    console.warn('Cannot find type for resource: ' + path);
    return 'image';
  }

  return type;
}

function isGeneric(str: string): boolean {
  return !!str 
    && !!str.length 
    && str.indexOf('`') === 0
    && str.lastIndexOf('`') === str.length - 1;
}
