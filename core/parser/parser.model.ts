export interface RawParserResult {
  chapters: RawChapter[];
  places: RawPlace[];
  markers: RawMarker[];
}

export type RawFileType = 'chapter' | 'place' | 'marker'

export interface RawFile {
  path: string;
  type: RawFileType;
}

export interface RawChapter {
  name: string;
  bool: string;
  timeout: number;
  party: RawProperty[];
  dialog: RawDialog[];
  media: RawProperty[];
  actions: RawProperty[];
  next: RawProperty[];
}

export interface RawDialog {
  name: string;
  character: number;
  media: RawProperty[];
  bool: string;
  text: RawTextDialog[];
  css: RawProperty[];
}

export interface RawTextDialog {
  text: string;
  media: RawProperty[];
  css: RawProperty[];
  bool: string;
}

export interface RawProperty {
  name: string;
  props: string;
  bool: string;
}

export interface RawPlace {
  name: string;
  bool: string;
  event: string;
  media: RawProperty[];
  css: RawProperty[];
}

export type RawMarkerType = 'place' | 'chapter' | 'event';
export interface RawMarker {
  name: string;
  target: string;
  action: string;
  bool: string;
  pos: [number, number];
  media: RawProperty[];
  type: RawMarkerType;
}

export interface BaseToken {
  regex: RegExp;
}

export interface SingleToken extends BaseToken {
  multi: false;
}

export interface MultiToken extends BaseToken {
  multi: true;
}

export type Token = SingleToken | MultiToken;

export interface Package {
  files: RawFile[];
  resMap: StringMap<string>;
  charMap: StringMap<string>;
}

export interface StringMap<T> {
  [key: string]: T | undefined
}

export interface MatchGroup<T> {
  index: number[];
  default?: string;
  parse: (match: string, prefix: string) => T | ((match: string) => T);
}

// deno-lint-ignore ban-types
export type Parser<T extends {}> = {
  [key in Extract<keyof T, string>]: MatchGroup<T[key]> | number;
} & { $match: RegExp, $onEnd?: (e: T, prefix: string) => T };
