import {
  Parser,
  RawMarker,
} from './parser.model.ts';
import {
  extractProp,
  P,
  toN,
} from './parser.tools.ts';

export const parserMarker: Parser<RawMarker> = {
  $match: /^#\s([\*\$\>])(?:<(.*?)>|)(.*?,.*?)\$(.*)\$(.*?)(?:\&(.*?)|)(?:\!(.*)|)$/gm,
  name: 2,
  target: 4,
  action: 5,
  bool: 7,
  pos: {
    index: [3],
    parse: (e: string) => {
      const [x, y] = e.split(',');
      return [toN(x), toN(y)];
    },
  },
  type: {
    index: [1],
    parse: (e: string) => {
      switch (e) {
        case '*':
          return 'place';
        case '$':
          return 'event';
        case '>':
          return 'chapter';
        default:
          throw new Error("Can't match mark type: " + e);
      }
    }
  },
  media: {
    index: [6],
    parse: (e: string) => {
      if (!e) return [];
      const media = e.split(':').map(extractProp);

      for (const m of media) {
        if (!m.props) {
          m.props = media[0].props || '40x40';
        }
      }

      return media;
    }
  },
  $onEnd: (e: RawMarker, prefix: string) => {
    e.target = P(e.target, prefix);
    if (e.type === 'event') return e;
    e.action = P(e.action, prefix);
    return e;
  }
}
