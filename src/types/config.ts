export interface NixDashboardConfig {
  systemArchitecture?: string;
  nixosRebuild?: {
    flakePath: string;
    hostname: string;
    preCommands: string[];
    rebuildOptions: string[];
    useSudo: boolean;
    useNom: boolean;
  };
}
