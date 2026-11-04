# Rust Nix Dashboard

A GUI frontend for Nix package manager, built with Rust + Tauri + React + TypeScript + TanStack Router + Tailwind CSS + Nix.

## Features

- **Package Search**: Search nixpkgs repository with `nix search`
- More features coming soon...

## Tech Stack

### Frontend

- React 19
- TypeScript 5.7
- TanStack Router 1.91
- TanStack Query 5.62
- Tailwind CSS 4.0
- Vite 6.0

### UI Libraries

- **React Spectrum S2** - Adobe's design system with 100+ accessible components
  - Primary component library for standard UI elements
  - Built-in accessibility, internationalization, and Spectrum design tokens
  - Learn more: https://react-spectrum.adobe.com/llms.txt

- **React Aria Components** - Low-level component primitives
  - Used when React Spectrum doesn't provide the needed component
  - Highly customizable, accessible components with hooks API
  - Works with React Stately for state management
  - Learn more: https://react-aria.adobe.com/llms.txt

- **React Stately** - State management hooks for complex components
  - Complements React Aria Components
  - Provides collection state, selection state, and other UI state logic
  - Learn more: https://react-aria.adobe.com/useListState.html

### Backend

- Rust
- Tauri 2.1

### Development Environment

- Nix Flakes
- pnpm 10

## Setup

### Prerequisites

Nix with Flakes support must be installed.

### Enter Development Environment

```bash
nix develop
```

### Install Dependencies

```bash
make install
```

## Development

### Start Development Server

**Desktop (Tauri):**

```bash
make dev
```

This will start the Vite development server and the Tauri desktop application.

**Browser:**

```bash
make dev-web
```

This will start only the Vite development server at http://localhost:1420. You can open it in your browser. Note that Tauri-specific features (like `nix search`) will not work in browser mode.

### Build

```bash
make build
```

### Clean

```bash
make clean
```

## gRPC API

The desktop app also serves the Nix operations over gRPC for external clients (CLIs and other tools). The webview frontend calls the same Rust implementation (`src-tauri/src/nix/`) through Tauri commands.

- Address: `[::1]:50051` (local only), started when the app launches
- Schema: `src-tauri/proto/nix_dashboard.proto` (service `nix_dashboard.NixDashboard`)
- Server reflection is not enabled, so pass the proto file to the client

If the port is already in use, the app keeps running without the gRPC API and logs the error to stderr.

Example with [grpcurl](https://github.com/fullstorydev/grpcurl):

```bash
cd src-tauri
grpcurl -plaintext -import-path proto -proto nix_dashboard.proto '[::1]:50051' nix_dashboard.NixDashboard/LoadConfig
grpcurl -plaintext -import-path proto -proto nix_dashboard.proto '[::1]:50051' nix_dashboard.NixDashboard/ProfileList
grpcurl -plaintext -import-path proto -proto nix_dashboard.proto -d '{"package_key":"hello"}' '[::1]:50051' nix_dashboard.NixDashboard/GetPackageDetail
```

## Project Structure

```
.
├── src/                    # React frontend source
│   ├── routes/            # TanStack Router route definitions
│   │   ├── __root.tsx    # Root layout
│   │   ├── index.tsx     # Home page
│   │   └── about.tsx     # About page
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind styles
├── src-tauri/             # Rust backend source
│   ├── src/              # Rust source code
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
├── flake.nix             # Nix development environment config
├── package.json          # Node.js dependencies
├── vite.config.js        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## Available Commands

- `make install` - Install dependencies
- `make dev` - Start development server
- `make build` - Create production build
- `make clean` - Remove build artifacts

## Features

- Type-safe routing (TanStack Router)
- Communication with Rust backend (Tauri)
- Hot module reload support
- Styling with Tailwind CSS
