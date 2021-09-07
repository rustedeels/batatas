import {
  MultiToken,
  SingleToken,
} from './parser.model.ts';

export const CHAPTER: SingleToken = {
  regex: /^#\s(.*)/gm,
  multi: false,
}

export const BOOL: SingleToken = {
  multi: false,
  regex: /^\!\s(.*)/gm
}

export const TIMEOUT: SingleToken = {
  multi: false,
  regex: /^T\s(\d+)/gm
}

export const MEDIA: MultiToken = {
  multi: true,
  regex: /^\&\s(.*)/gm
}

export const EVENT: MultiToken = {
  multi: true,
  regex: /^\$\s(.*)/gm
}

export const NEXT: MultiToken = {
  multi: true,
  regex: /^\>\s(.*)/gm
}

export const CSS: MultiToken = {
  multi: true,
  regex: /^C\s(.*)/gm
}

export const DIALOG: SingleToken = {
  regex: /^##\s(.*)/gm,
  multi: false,
}

export const DIALOG_TEXT: SingleToken = {
  regex: /^\*\s(.*)/gm,
  multi: false,
}

export const SIZE: SingleToken = {
  regex: /^S\s(.*)/gm,
  multi: false,
}

export const POSITION: SingleToken = {
  regex: /^P\s(.*)/gm,
  multi: false,
}

export const PLACE: SingleToken = {
  regex: /^#\s(.*)/gm,
  multi: false,
}

export const MARKER: MultiToken = {
  regex: /^#\s([\*\$\>])(?:<(.*?)>|)(.*?),(.*?)\$(.*)\$(.*?)(?:\&(.*?)|)(?:\!(.*)|)$/gm,
  multi: true,
}

export const MARKER_MEDIA: MultiToken = {
  regex: /^\:\s(.*)/gm,
  multi: true,
}

export const MARKER_PLACE: MultiToken = {
  regex: /^\*\s(.*)/gm,
  multi: true,
}

export const MARKER_CHAPTER: MultiToken = {
  multi: true,
  regex: /^\>\s(.*)/gm
}

export const TARGET: MultiToken = {
  regex: /^\<\s(.*)/gm,
  multi: true,
}

export const NEXT_PLACE: MultiToken = {
  regex: /^\-\s(.*)/gm,
  multi: true,
}

export const PROPERTY_REGEX = /^(.*?)\[(.*)\]\((.*)\)|^(.*?)\[(.*)\]|^(.*?)\((?!.*\)`)(.*)\)|^(.*)/gm;
export const SECTION_REGEX = /(.*)\|(.*)|(.*)/gm;

