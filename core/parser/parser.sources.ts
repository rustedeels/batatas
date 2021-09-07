import { parseChapters } from './parser.chapter.ts';
import { parserMarker } from './parser.marker.ts';
import {
  RawFile,
  RawFileType,
  RawParserResult,
} from './parser.model.ts';
import { parserPlace } from './parser.place.ts';
import { parseAll } from './parser.ts';

export async function parseSources(files: RawFile[]): Promise<RawParserResult> {
  const chapters = parseChapters(await getSourceFile(files, 'chapter'))
  const places = parseAll(await getSourceFile(files, 'place'), parserPlace)
  const markers = parseAll(await getSourceFile(files, 'marker'), parserMarker)

  return { chapters, places, markers };
}

async function getSourceFile(files: RawFile[], type: RawFileType): Promise<string[]> {
  const sources: string[] = [];
  for (const file of files.filter(f => f.type === type)) {
    const src = await Deno.readTextFile(file.path);
    sources.push(src);
  }
  return sources;
}
