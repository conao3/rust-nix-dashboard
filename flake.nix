{
  description = "Rust + Tauri development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
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
          pkgs,
          system,
          config,
          ...
        }:
        let
          overlay = final: prev:
            let
              nodejs = prev.nodejs_22;
              pnpm = prev.pnpm_10.override { inherit nodejs; };
            in
            {
              inherit nodejs pnpm;
            };
          pkgs = import inputs.nixpkgs {
            inherit system;
            overlays = [ overlay ];
          };

          linuxPackages = with pkgs; [
            webkitgtk_4_1
            gtk3
            libsoup_3
            glib-networking
            openssl
            pkg-config
            librsvg
          ];

          darwinPackages = with pkgs; [
            darwin.apple_sdk.frameworks.WebKit
            darwin.apple_sdk.frameworks.AppKit
            darwin.apple_sdk.frameworks.CoreServices
          ];

          platformPackages = if pkgs.stdenv.isLinux then linuxPackages else darwinPackages;
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
                nodejs
                pnpm
              ]
              ++ platformPackages;
          };

          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              nixfmt.enable = true;
              rustfmt.enable = true;
              prettier.enable = true;
            };
          };

          formatter = config.treefmt.build.wrapper;
        };
    };
}
