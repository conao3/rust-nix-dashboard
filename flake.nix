{
  description = "Rust + Tauri development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-darwin"
      ];

      imports = [ inputs.treefmt-nix.flakeModule ];

      perSystem =
        {
          lib,
          system,
          ...
        }:
        let
          pkgs = inputs.nixpkgs.legacyPackages.${system};

          linuxBuildInputs = with pkgs; [
            webkitgtk_4_1
            gtk3
            libsoup_3
            glib-networking
            openssl
            librsvg
          ];
        in
        {
          devShells.default = pkgs.mkShell {
            packages =
              with pkgs;
              [
                rustc
                cargo
                rust-analyzer
                rustfmt
                clippy
                nodejs_26
                (pnpm.override { nodejs-slim = nodejs-slim_26; })
                protobuf
              ]
              ++ lib.optionals stdenv.hostPlatform.isLinux [ pkg-config ];

            buildInputs = lib.optionals pkgs.stdenv.hostPlatform.isLinux linuxBuildInputs;

            env = lib.optionalAttrs pkgs.stdenv.hostPlatform.isLinux {
              GIO_MODULE_PATH = "${pkgs.glib-networking}/lib/gio/modules";
            };
          };

          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              nixfmt.enable = true;
              rustfmt.enable = true;
              prettier.enable = true;
            };
            settings.global.excludes = [
              "pnpm-lock.yaml"
              "src-tauri/gen/*"
            ];
          };
        };
    };
}
