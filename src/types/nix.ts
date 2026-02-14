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

export interface NixPackageLicense {
  shortName?: string;
  spdxId?: string;
  fullName?: string;
  url?: string;
  free?: boolean;
  redistributable?: boolean;
  deprecated?: boolean;
}

export interface NixPackageMaintainer {
  name?: string;
  email?: string;
  github?: string;
  githubId?: number;
  matrix?: string;
}

export interface NixPackageDetail {
  name?: string;
  description?: string;
  longDescription?: string;
  homepage?: string;
  license?: NixPackageLicense;
  platforms?: string[];
  changelog?: string;
  mainProgram?: string;
  available?: boolean;
  broken?: boolean;
  insecure?: boolean;
  unfree?: boolean;
  unsupported?: boolean;
  maintainers?: NixPackageMaintainer[];
}
