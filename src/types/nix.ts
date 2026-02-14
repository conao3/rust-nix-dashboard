export interface NixPackage {
  pname: string;
  version: string;
  description?: string;
  longDescription?: string;
  homepage?: string;
  license?: string;
  platforms?: string[];
}

export type NixSearchResults = Record<string, NixPackage>;
