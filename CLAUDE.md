# Claude Instructions for rust-nix-dashboard

## Project Overview

This is a GUI frontend for the Nix package manager. The goal is to provide an intuitive interface for common Nix operations like package search, installation, and system management.

## Getting Started

When starting work on this project, read `README.md` first to understand:

- The tech stack and architecture
- Available commands and development workflow
- Project structure
- UI library strategy (React Spectrum → React Aria Components → custom)
- Current features and roadmap

## Development Workflow

1. Enter the Nix development environment: `nix develop`
2. Install dependencies: `make install`
3. Start development server:
   - Desktop (Tauri): `make dev` - Full functionality
   - Browser: `make dev-web` - UI development only (Tauri features won't work)

## Security Note

This project uses `__TAURI_INTERNALS__` to detect Tauri environment instead of `withGlobalTauri` for better security. The `withGlobalTauri` option exposes the entire Tauri API globally, which is a security risk.

## UI Component Strategy

Follow this priority order when building UI components:

1. **React Spectrum S2** (primary) - Use for standard components
   - DO NOT customize styles - use components as-is
   - Use Tailwind only for layout containers (divs) around Spectrum components
2. **React Aria Components** - Use when Spectrum doesn't provide the component or when custom styling is required
   - Fully customizable with Tailwind CSS
3. **Custom with Tailwind** - Use only when neither library provides what you need

### Important Notes

- React Spectrum S2 components do not accept custom styles
- Use Tailwind for layout (flexbox, grid, spacing, borders, backgrounds) around Spectrum components
- Use React Aria Components when you need style customization

Consult the LLM-optimized documentation:

- React Spectrum: https://react-spectrum.adobe.com/llms.txt
- React Aria: https://react-aria.adobe.com/llms.txt
