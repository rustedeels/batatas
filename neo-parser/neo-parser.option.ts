import { exists } from 'https://deno.land/std@0.105.0/fs/mod.ts';
import { join } from 'https://deno.land/std@0.105.0/path/mod.ts';

import {
  buildOptions,
  NeoParserOptions,
} from './neo-parser.model.ts';

export async function initOptions(path: string, replace: boolean): Promise<boolean> {
  const filePath = buildFullPath(path);

  if (!replace && await exists(filePath)) {
    return false;
  }

  const content = JSON.stringify(buildOptions({}), null, 2);
  await Deno.writeTextFile(filePath, content);
  return true;
}

export async function getOptions(path: string): Promise<NeoParserOptions> {
  const filePath = buildFullPath(path);
  if (!await exists(filePath)) {
    throw new Error(`${filePath} not found`);
  }

  const content = await Deno.readTextFile(filePath);
  const o = JSON.parse(content) as NeoParserOptions;
  o.outputFolder = join(path, o.outputFolder);
  o.resourcesFolder = join(path, o.resourcesFolder);
  o.sourcesFolder = join(path, o.sourcesFolder);

  return o;
}

function buildFullPath(path: string): string {
  return join(path, '.batatas.json');
}
