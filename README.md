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

```bash
make dev
```

This will start the Vite development server (http://localhost:1420) and the Tauri application.

### Build

```bash
make build
```

### Clean

```bash
make clean
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
