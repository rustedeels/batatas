import { join } from 'https://deno.land/std@0.105.0/path/mod.ts';

import {
  NeoParserOptions,
  SourcePack,
} from './neo-parser.model.ts';

export async function loadPackages(o: NeoParserOptions): Promise<SourcePack[]> {
  const resFolderMap = await loadFolderMap(o.resourcesFolder);
  const srcFolderMap = await loadFolderMap(o.sourcesFolder);

  const packs: SourcePack[] = [];

  for (const [name, path] of srcFolderMap) {
    packs.push(await buildSourcePack(name, path, resFolderMap, o));
  }

  for (const [name, path] of resFolderMap) {
    packs.push(await buildResourcePack(name, path, o));
  }

  return packs;
}

async function loadFolderMap(path: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  
  let hasRootFiles = false;
  for await (const entry of Deno.readDir(path)) {
    if (entry.isFile) { hasRootFiles = true; continue; }

    if (entry.isDirectory) {
      for await (const sub of Deno.readDir(join(path, entry.name))) {
        if (sub.isFile) {
          map.set(entry.name, join(path, entry.name));
          break;
        }
      }
    }
  }
  if (hasRootFiles) { map.set('root', path); }

  return map;
}

async function buildSourcePack(
  name: string,
  path: string,
  resMap: Map<string, string>,
  o: NeoParserOptions
): Promise<SourcePack> {
  const pack: SourcePack = {
    name,
    res: [],
    src: [],
    package: buildOutPath(name, o.packageFile, o),
    resList: buildOutPath(name, o.resFile, o),
    resNames: buildOutPath(name, o.nameFile, o),
    charMap: buildOutPath('char', o.mapFile, o, name),
    resMap: buildOutPath('res', o.mapFile, o, name),
  };

  for await (const entry of Deno.readDir(path)) {
    if (entry.isFile) {
      pack.src.push(join(path, entry.name));
    }
  }

  const resFolder = resMap.get(name);
  if (resFolder) {
    resMap.delete(name);
    for await (const entry of Deno.readDir(resFolder)) {
      if (entry.isFile) {
        pack.res.push(join(resFolder, entry.name));
      }
    }
  }

  return pack;
}

async function buildResourcePack(
  name: string,
  path: string,
  o: NeoParserOptions
): Promise<SourcePack> {
  const pack: SourcePack = {
    name,
    res: [],
    src: [],
    package: buildOutPath(name, o.packageFile, o),
    resList: buildOutPath(name, o.resFile, o),
    resNames: buildOutPath('res', o.nameFile, o, name),
    resMap: '',
    charMap: '',
  };

  for await (const entry of Deno.readDir(path)) {
    if (entry.isFile) {
      pack.res.push(join(path, entry.name));
    }
  }

  return pack;
}

function buildOutPath(name: string, ext: string, o: NeoParserOptions, folder?: string): string {
  return join(o.outputFolder, (folder ?? name), buildName(name, ext));
}

function buildName(name: string, ext: string) {
  return `${name}${ext}`;
}
