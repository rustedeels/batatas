import { Parser } from './parser.model.ts';
import {
  getGroupValue,
  getPrefix,
  matchMulti,
} from './parser.tools.ts';

export function parseAll<T>(src: string[], parser: Parser<T>): T[] {
  return src.flatMap(e => parseSource(e, parser));
}

export function parseSource<T>(src: string, parser: Parser<T>): T[] {
  const prefix = getPrefix(src);
  return matchMulti(src, parser.$match).map(m => parseSingle(m, parser, prefix));
}

export function parseSingle<T>(match: RegExpMatchArray, parser: Parser<T>, prefix: string): T {
  const value: Partial<T> = {};

  for (const index in parser) {
    const key = index as keyof Parser<T>;
    if (key !== '$match' && key !== '$onEnd') {
      const groupParser = parser[key];
      if (typeof groupParser === 'number') {
        // deno-lint-ignore no-explicit-any
        value[key] = (match[groupParser] ?? '') as any;
        continue;
      }

      const val = getGroupValue(match, groupParser);
      // deno-lint-ignore no-explicit-any
      value[key] = (groupParser.parse(val, prefix)) as any;
    }
  }

  return parser.$onEnd ? parser.$onEnd(value as T, prefix) : value as T;
}
