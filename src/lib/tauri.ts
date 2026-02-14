import { invoke as tauriInvoke } from "@tauri-apps/api/core";

const MOCK_NIX_SEARCH_RESULTS = {
  "legacyPackages.x86_64-linux.hello": {
    pname: "hello",
    version: "2.12.1",
    description: "A program that produces a familiar, friendly greeting",
  },
  "legacyPackages.x86_64-linux.git": {
    pname: "git",
    version: "2.43.0",
    description: "Distributed version control system",
  },
  "legacyPackages.x86_64-linux.vim": {
    pname: "vim",
    version: "9.0.2116",
    description: "The most popular clone of the VI editor",
  },
  "legacyPackages.x86_64-linux.emacs": {
    pname: "emacs",
    version: "29.1",
    description: "The extensible, customizable GNU text editor",
  },
  "legacyPackages.x86_64-linux.python3": {
    pname: "python3",
    version: "3.11.6",
    description: "A high-level dynamically-typed programming language",
  },
  "legacyPackages.x86_64-linux.nodejs": {
    pname: "nodejs",
    version: "20.10.0",
    description: "Event-driven I/O framework for the V8 JavaScript engine",
  },
  "legacyPackages.x86_64-linux.rust": {
    pname: "rust",
    version: "1.74.1",
    description: "A safe, concurrent, practical language",
  },
  "legacyPackages.x86_64-linux.gcc": {
    pname: "gcc",
    version: "13.2.0",
    description: "GNU Compiler Collection, version 13.2.0",
  },
  "legacyPackages.x86_64-linux.firefox": {
    pname: "firefox",
    version: "121.0",
    description: "A web browser built from Firefox source tree",
  },
  "legacyPackages.x86_64-linux.vscode": {
    pname: "vscode",
    version: "1.85.1",
    description: "Open source source code editor developed by Microsoft",
  },
};

export async function invoke<T>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  if (!("__TAURI_INTERNALS__" in window)) {
    if (cmd === "nix_search") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return JSON.stringify(MOCK_NIX_SEARCH_RESULTS) as T;
    }
    throw new Error(
      "Tauri is not available. Please run 'make dev' instead of 'make dev-web' to use Tauri features.",
    );
  }

  return tauriInvoke<T>(cmd, args);
}
