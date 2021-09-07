import { Args } from 'https://deno.land/std@0.105.0/flags/mod.ts';

import { CliCommandMap } from './_.ts';
import {
  CliArgument,
  CliCommand,
  CliOption,
} from './cli.model.ts';

export const cmdArg: CliArgument = {
  name: "command",
  description: "Command to show help",
  required: false,
}

export const HelpCommand: CliCommand = {
  name: "help",
  description: "Show help",
  args: [cmdArg],
  options: [],
  action,
}

function action(args: (string | number)[], _: Args): Promise<number> {
  if (args.length === 0) {
    printHelp();
    return Promise.resolve(0);
  }

  const cmd = CliCommandMap.find(e => e.name === args[0]);
  if (!cmd) {
    console.error(`Command ${args[0]} not found`);
    return Promise.resolve(1);
  }

  printCommand(cmd, true);
  return Promise.resolve(0);
}

function printHelp(): void {
  console.log("Run: [Command]  [...arguments] options");
  console.log("\nAvailable Commands:");
  for (const c of CliCommandMap) {
    printCommand(c);
  }
  console.log('\nFor command details: help [command]')
}

function printCommand(cmd: CliCommand, full = false): void {
  if (!full) {
    console.log(` ${cmd.name}`);
    console.log(`   ${cmd.description}`);
  } else {
    console.log(cmd.description);
    console.log(`Run: ${cmd.name} ${buildArguments(cmd.args)} ...options`);

    console.log("\nArguments:");
    for(const arg of cmd.args) {
      printArgument(arg);
    }

    console.log("\nOptions:");
    for(const opt of cmd.options) {
      printOption(opt);
    }
  }
}

function buildArguments(args: CliArgument[]): string {
  const name = (a: CliArgument) => a.required ? `<${a.name}>` : `[${a.name}]`;
  return args.map(a => name(a)).join(" ");
}

function printArgument(arg: CliArgument): void {
  console.log(`  ${arg.name}`);
  console.log(`    ${arg.description}`);
}

function printOption(opt: CliOption<unknown>): void {
  const value = opt.hasValue ? `<${opt.defaultValue || 'value'}>` : "";
  const short = opt.shortName ? `, -${opt.shortName}` : "";
  console.log(`  --${opt.name}${short} ${value}`);
  console.log(`    ${opt.description}`);
}
