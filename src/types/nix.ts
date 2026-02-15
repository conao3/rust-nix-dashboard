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

export interface NixDerivationOutput {
  path: string;
}

export interface NixDerivationInputDrv {
  dynamicOutputs: Record<string, unknown>;
  outputs: string[];
}

export interface NixDerivation {
  name: string;
  system: string;
  builder: string;
  args: string[];
  env: Record<string, string>;
  inputDrvs: Record<string, NixDerivationInputDrv>;
  inputSrcs: string[];
  outputs: Record<string, NixDerivationOutput>;
}

export type NixDerivationShowResult = Record<string, NixDerivation>;

export interface NixProfileElement {
  active: boolean;
  priority: number;
  storePaths: string[];
}

export interface NixProfileListResult {
  elements: Record<string, NixProfileElement>;
  version: number;
}
