import { Args } from 'https://deno.land/std@0.105.0/flags/mod.ts';
import {
  emptyDir,
  ensureDir,
  exists,
} from 'https://deno.land/std@0.105.0/fs/mod.ts';
import {
  extname,
  join,
} from 'https://deno.land/std@0.106.0/path/mod.ts';

import { parseChapters } from '../../core/parser/parser.chapter.ts';
import { parserMarker } from '../../core/parser/parser.marker.ts';
import { parserPlace } from '../../core/parser/parser.place.ts';
import { parseSource } from '../../core/parser/parser.ts';
import {
  CliArgument,
  CliCommand,
  CliOption,
  getOptionValue,
} from './cli.model.ts';

const inputFolderArg: CliArgument = {
  name: 'inputFolder',
  description: 'The folder to scan for files',
  required: false,
  defaultValue: './templates'
};

const outputFolderArg: CliArgument = {
  name: 'outputFolder',
  description: 'The folder to save parsed JSON files',
  required: false,
  defaultValue: './output'
};

const cleanOpt: CliOption<boolean> = {
  name: 'clean',
  shortName: 'c',
  description: 'Clean the output folder before parsing',
  required: false,
  defaultValue: false,
  hasValue: false,
}

export const TestParserCommand: CliCommand = {
  name: 'test-parser',
  description: 'Test the parser',
  args: [inputFolderArg, outputFolderArg],
  options: [cleanOpt],
  action: testParser,
}

async function testParser(args: (string | number)[], opt: Args): Promise<number> {
  const inFolder = args[0] as string || inputFolderArg.defaultValue;
  const outFolder = args[1] as string || outputFolderArg.defaultValue;

  if (!inFolder || !await exists(inFolder)) {
    console.error(`Input folder ${inFolder} does not exist`);
    return 1;
  }

  if (!outFolder) {
    console.error(`Invalid output folder ${outFolder}`);
    return 1;
  }

  await ensureDir(outFolder);

  const cleanFolder = !!getOptionValue(opt, cleanOpt);
  if (cleanFolder) { await emptyDir(outFolder); }

  const outputFiles: [name: string, content: string][] = [];

  for await (const file of Deno.readDir(inFolder)) {
    if (!file.isFile) continue;
    const fullPath = join(inFolder, file.name);
    const content = await parseFile(fullPath);
    if (content) outputFiles.push([file.name + '.json', content]);
  }

  for (const [name, content] of outputFiles) {
    const outPath = join(outFolder, name);
    await Deno.writeTextFile(outPath, content);
  }

  return 0;
}

const PARSE_MAP = {
  '.chapter': (src: string) => parseChapters([src]),
  '.place': (src: string) => parseSource(src, parserPlace),
  '.marker': (src: string) => parseSource(src, parserMarker),
}

async function parseFile(filePath: string): Promise<string | undefined> {
  const ext = extname(filePath) as keyof typeof PARSE_MAP;
  const validExt = !!Object.keys(PARSE_MAP).find(e => e === ext);
  if (!validExt) return undefined;

  const content = await Deno.readTextFile(filePath);
  const parsed = PARSE_MAP[ext](content);
  return JSON.stringify(parsed, null, 2);
}
