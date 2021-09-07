export interface NeoParserOptions {
  resourcesFolder: string;
  sourcesFolder: string;
  outputFolder: string;

  nameFile: string;
  mapFile: string;
  resFile: string;
  packageFile: string;
}

export function buildOptions(o: Partial<NeoParserOptions>): NeoParserOptions {
  return {
    resourcesFolder: o.resourcesFolder || 'resources',
    sourcesFolder: o.sourcesFolder || 'sources',
    outputFolder: o.outputFolder || 'output',
    mapFile: o.mapFile || '.map.ts',
    nameFile: o.nameFile || '.enum.ts',
    resFile: o.resFile || '.res.ts',
    packageFile: o.packageFile || '.pack.ts',
  }
}

export interface SourcePack {
  /** Package name */
  name: string;
  /** Source files */
  src: string[];
  /** resource files */
  res: string[];
  /** file to save characters map */
  charMap: string;
  /** file to save resources map */
  resMap: string;
  /** file to list all resources */
  resList: string;
  /** file to enum resources names */
  resNames: string;
  /** file to save package info */
  package: string;
}

export type ResourceType = 'video' | 'image' | 'sound' | 'music' | 'background'

export interface Resource {
  id: string;
  type: ResourceType;
  tags: string[];
  path: string;
}

export interface ResourceFile {
  path: string;
  export: string;
  enum: string;
  items: Resource[];
}

export interface EnumFile {
  header: string;
  path: string;
  export: string;
  items: Map<string, string>;
}

export interface OutputPack {
  name: string;
  package: string;
  sources: string[];
  resources: ResourceFile;
  resEnum: EnumFile;
  resMap: EnumFile;
  charMap: EnumFile;
}
