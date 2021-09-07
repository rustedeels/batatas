import {
  Parser,
  RawPlace,
} from './parser.model.ts';
import {
  extractProp,
  P,
  toPascalCase,
} from './parser.tools.ts';

export const parserPlace: Parser<RawPlace> = {
  $match: /^#\s(.*?)(?:\&(.*?)|)(?:\$(.*?)|)(?:\!(.*?)|)(?:<(.*)>|)$/gm,
  name: 1,
  event: 3,
  bool: 4,
  media: {
    index: [2],
    parse: (e: string) => {
      if (!e) return [];
      const media = e.split(':').map(extractProp);

      for (const m of media) {
        if (!m.props) {
          m.props = media[0].props || '1920x1080';
        }
      }

      return media;
    }
  },
  css: {
    index: [5],
    parse: (e: string) => {
      if (!e) return [];
      return e.split(';').map(extractProp);
    }
  },
  $onEnd: (e: RawPlace, prefix: string) => {
    e.name = P(e.name, prefix);

    if (!e.media.length) {
      e.media = [{
        props: '1920x1080',
        name: toPascalCase(`place-${e.name.replace(`${prefix}=>`, '')}`),
        bool: ''
      }];
    }

    return e;
  }
}

