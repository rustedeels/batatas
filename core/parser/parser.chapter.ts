import {
  RawChapter,
  RawDialog,
  RawProperty,
  RawTextDialog,
} from './parser.model.ts';
import {
  BOOL,
  CHAPTER,
  CSS,
  DIALOG,
  DIALOG_TEXT,
  EVENT,
  MEDIA,
  NEXT,
  SECTION_REGEX,
  TIMEOUT,
} from './parser.tokens.ts';
import {
  extractProp,
  extractToken,
  matchSingle,
  multiProp,
  P,
  regexSplit,
} from './parser.tools.ts';

/**
 * Parse chapter files and return its object
 * @param sources text sources to parse
 * @returns
 */
export function parseChapters(sources: string[]): RawChapter[] {
  return sources.flatMap(parseRawChapters);
}

function parseRawChapters(src: string): RawChapter[] {
  const parts = regexSplit(src, CHAPTER.regex);
  if (!parts.length) return [];
  if (parts.length === 1) return parts.map(e => parseRawChapter(e, ''))

  const prefix = parts[0]?.trim() ?? '';
  return parts.slice(1).map(e => parseRawChapter(e, prefix));
}

function parseRawChapter(src: string, prefix: string): RawChapter {
  const [chapter, ...dialogs] = regexSplit(src, DIALOG.regex);
  if (!chapter) throw new Error('Chapter not defined for: ' + src);
  const [name, party] = parseChapterNameParty(
    extractToken(chapter, CHAPTER), prefix);

  return {
    name,
    party,
    bool: extractToken(chapter, BOOL),
    timeout: getTimeout(chapter),
    actions: multiProp(chapter, EVENT),
    media: multiProp(chapter, MEDIA),
    next: multiProp(chapter, NEXT),
    dialog: dialogs.map(e => parseDialog(e, prefix))
  }
}

function parseChapterNameParty(raw: string, prefix: string): [string, RawProperty[]] {
  const m = matchSingle(raw, SECTION_REGEX);
  if (!m) throw new Error('Error parsing chapter title')

  const name = m[1] ?? m[3] ?? '';
  const char = (m[2] ?? '')
    .split(',')
    .filter(e => !!e)
    .map(extractProp);

  return [P(name, prefix), char];
}

function parseDialog(src: string, _: string): RawDialog {
  const [dialog, ...texts] = regexSplit(src, DIALOG_TEXT.regex);
  if (!dialog) throw new Error('Dialog not defined for: ' + src);
  const [name, character] = parseDialogChar(extractToken(dialog, DIALOG));
  return {
    name,
    character,
    bool: extractToken(dialog, BOOL),
    media: multiProp(dialog, MEDIA),
    text: texts.map(parseDialogText),
    css: multiProp(dialog, CSS),
  }
}

function parseDialogChar(raw: string): [string, number] {
  const m = matchSingle(raw, SECTION_REGEX);
  if (!m) throw new Error('Error parsing dialog title')

  const name = m[1] ?? m[3] ?? '';
  const char = parseInt(m[2] ?? '', 10);
  return [name, isNaN(char) ? 0 : char];
}

function parseDialogText(src: string): RawTextDialog {
  return {
    text: extractToken(src, DIALOG_TEXT),
    bool: extractToken(src, BOOL),
    media: multiProp(src, MEDIA),
    css: multiProp(src, CSS),
  }
}

function getTimeout(part: string): number {
  const timeout = Number(extractToken(part, TIMEOUT));
  return (!isNaN(timeout) && isFinite(timeout)) ? timeout : 0;
}
