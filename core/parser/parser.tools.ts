import {
  MatchGroup,
  MultiToken,
  RawProperty,
  SingleToken,
  Token,
} from './parser.model.ts';
import { PROPERTY_REGEX } from './parser.tokens.ts';

/** Extract property in format text[prop](bool) */
export function extractProp(src: string): RawProperty {
  const m = matchSingle(src, PROPERTY_REGEX);
  if (!m) throw new Error('Error match property for: ' + src);

  return {
    name: m[1] ?? m[4] ?? m[6] ?? m[8] ?? '',
    props: m[2] ?? m[5] ?? '',
    bool: m[3] ?? m[7] ?? '',
  }
}

/** Return first match and its groups */
export function matchSingle(src: string, regex: RegExp): RegExpMatchArray | undefined {
  const all = src.matchAll(regex);
  for (const m of all) return m;
  return undefined;
}

export function matchMulti(src: string, regex: RegExp): RegExpMatchArray[] {
  const all = src.matchAll(regex);
  const res: RegExpMatchArray[] = [];
  for (const m of all) res.push(m);
  return res;
}

/**
 * Extract match strings
 *
 * @param src Source string
 * @param token Token to match
 */
export function extractToken(src: string, token: MultiToken): string[]
export function extractToken(src: string, token: SingleToken): string;
export function extractToken(src: string, token: Token): string | string[] {
  const res: string[] = [];
  const matches = src.matchAll(token.regex);

  for (const m of matches) {
    const group = (m && m[1])?.trim();
    if (group) res.push(group);
    if (!token.multi) break;
  }

  return token.multi ? res : (res[0] || '');
}

/**
 * Split string by regex match
 *
 * @param str Source string
 * @param regex Regex to match split points
 * @returns string parts
 */
export function regexSplit(str: string, regex: RegExp): string[] {
  const res: string[] = [];

  while (true) {
    if (str.length < 2) {
      res.push(str);
      break;
    }

    let i = str.substring(1).search(regex);
    if (i === -1) {
      res.push(str);
      break;
    }
    i++;

    res.push(str.substr(0, i));
    str = str.substring(i);
  }

  return res;
}

export function getGroupValue(m: RegExpMatchArray, g: MatchGroup<unknown>) {
  for (const i of g.index)
    if (m[i]) return m[i];

  return g.default ?? '';
}

export function getPrefix(src: string): string {
  const firstLine = src.split('\n')[0];
  return firstLine.charAt(0) === '#' ? '': firstLine.trim();
}

export function isPrefix(src: string): boolean {
  return src.split('=>').length > 1;
}

export const P = (val: string, prefix: string) => isPrefix(val) ? val : `${prefix}=>${val}`;

export const N = (n: number) => isFinite(n) && !isNaN(n) ? n : 0;

// deno-lint-ignore no-explicit-any
export const toN = (val: any) => N(parseFloat(val));

export const multiProp = (src: string, token: MultiToken)=>
  extractToken(src, token).map(e => extractProp(e));

export function toPascalCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}
