import { Args } from 'https://deno.land/std@0.105.0/flags/mod.ts';
import { exists } from 'https://deno.land/std@0.105.0/fs/mod.ts';

import {
  getOptions,
  initOptions,
} from '../../neo-parser/neo-parser.option.ts';
import {
  CliArgument,
  CliCommand,
  CliOption,
  getOptionValue,
} from './cli.model.ts';

export const folder: CliArgument = {
  name: "folder path",
  description: "folder to save options file",
  required: true,
}

export const forceOpt: CliOption<boolean> = {
  name: "force",
  description: "overwrite existing options file",
  shortName: "f",
  required: false,
  hasValue: false,
}

export const statusOpt: CliOption<boolean> = {
  name: "status",
  shortName: "s",
  required: false,
  hasValue: false,
  description: "show status of options file",
}

export const InitCommand: CliCommand = {
  name: "init",
  description: "initialize batatas project",
  args: [folder],
  options: [forceOpt, statusOpt],
  action,
}

async function action(args: (string | number)[], opt: Args): Promise<number> {
  const folderPath = args[0]?.toString();
  const replace = !!getOptionValue(opt, forceOpt);
  const status = !!getOptionValue(opt, statusOpt);

  if (!folderPath) {
    console.error("folder path is required");
    return 1;
  }

  if (!await exists(folderPath)) {
    console.error(`folder path does not exist at ${folderPath}`);
    return 1;
  }

  if (status) {
    console.log(`checking ${folderPath} for options file`);
    const options = await getOptions(folderPath);
    console.log(options);
    return 0;
  }

  const created = await initOptions(folderPath, replace);

  if (created) {
    console.log(`options file created at ${folderPath}`);
  } else {
    console.log(`options file already exists at ${folderPath}`);
    console.log('Use --force to overwrite');
  }

  return 0;
}
