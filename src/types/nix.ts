export interface NixPackage {
  pname: string;
  version: string;
  description?: string;
}

export type NixSearchResults = Record<string, NixPackage>;
