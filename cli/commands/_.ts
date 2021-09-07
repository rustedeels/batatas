import { CliCommand } from './cli.model.ts';
import { InitCommand } from './init.cmd.ts';
import { ParserCommand } from './parser.cmd.ts';
import { TestParserCommand } from './test-parser.cmd.ts';

export const CliCommandMap: CliCommand[] = [
  InitCommand,
  ParserCommand,
  TestParserCommand,
];
