import { Args } from 'https://deno.land/std@0.105.0/flags/mod.ts';
import { exists } from 'https://deno.land/std@0.105.0/fs/mod.ts';

import { loadPackages } from '../../neo-parser/neo-parser.input.ts';
import { NeoParserOptions } from '../../neo-parser/neo-parser.model.ts';
import { getOptions } from '../../neo-parser/neo-parser.option.ts';
import { parseProject } from '../../neo-parser/neo-parser.ts';
import {
  CliArgument,
  CliCommand,
  CliOption,
  getOptionValue,
} from './cli.model.ts';

export const folder: CliArgument = {
  name: "folder path",
  description: "folder parse sources",
  required: true,
}

export const previewOpt: CliOption<boolean> = {
  name: "preview",
  shortName: "p",
  required: false,
  hasValue: false,
  description: "preview file count and output paths",
}

export const ParserCommand: CliCommand = {
  name: "parser",
  description: "Parse source files and list resources for project",
  args: [folder],
  options: [previewOpt],
  action,
}

async function action(args: (string | number)[], opt: Args): Promise<number> {
  const folderPath = args[0]?.toString();
  const preview = !!getOptionValue(opt, previewOpt);
  
  if (!folderPath) {
    console.error("folder path is required");
    return 1;
  }
  
  if (!await exists(folderPath)) {
    console.error(`folder path does not exist at ${folderPath}`);
    return 1;
  }
  
  const options = await getOptions(folderPath);

  if (preview) {
    return await printPreview(options);
  }
  await parseProject(options);

  return 0;
}

async function printPreview(options: NeoParserOptions): Promise<number> {
  const packages = await loadPackages(options);

  console.log(`${packages.length} packages found`);

  for (const p of packages) {
    console.log(`\nPackage ${p.name}:`);
    console.log(`  Entry: ${p.package}`);
    console.log(`  Resources: ${p.resList}`);
    console.log(`  Resources names: ${p.resNames}`);
    console.log(`  Resources maps: ${p.resMap}`);
    console.log(`  Character maps: ${p.charMap}`);
    console.log(`  Found ${p.res.length} resource files`);
    console.log(`  Found ${p.src.length} source files:`);
    for (const s of p.src) {
      console.log(`    ${s}`);
    }
  }

  return 0;
}
