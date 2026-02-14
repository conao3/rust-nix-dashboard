import { invoke as tauriInvoke } from "@tauri-apps/api/core";

const MOCK_NIX_SEARCH_RESULTS = {
  "legacyPackages.x86_64-linux.hello": {
    pname: "hello",
    version: "2.12.1",
    description: "A program that produces a familiar, friendly greeting",
    longDescription:
      "GNU Hello prints the message 'Hello, world!' and then exits. It serves as an example of standard GNU coding practices.",
    homepage: "https://www.gnu.org/software/hello/",
    license: "GPL-3.0-or-later",
    platforms: ["x86_64-linux", "aarch64-linux", "x86_64-darwin"],
  },
  "legacyPackages.x86_64-linux.git": {
    pname: "git",
    version: "2.43.0",
    description: "Distributed version control system",
    longDescription:
      "Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.",
    homepage: "https://git-scm.com/",
    license: "GPL-2.0-only",
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
  },
  "legacyPackages.x86_64-linux.vim": {
    pname: "vim",
    version: "9.0.2116",
    description: "The most popular clone of the VI editor",
    longDescription:
      "Vim is a highly configurable text editor built to enable efficient text editing. It is an improved version of the vi editor distributed with most UNIX systems.",
    homepage: "https://www.vim.org/",
    license: "Vim",
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
  },
  "legacyPackages.x86_64-linux.emacs": {
    pname: "emacs",
    version: "29.1",
    description: "The extensible, customizable GNU text editor",
    longDescription:
      "GNU Emacs is an extensible, customizable, free text editor. At its core is an interpreter for Emacs Lisp, a dialect of the Lisp programming language.",
    homepage: "https://www.gnu.org/software/emacs/",
    license: "GPL-3.0-or-later",
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
  },
  "legacyPackages.x86_64-linux.python3": {
    pname: "python3",
    version: "3.11.6",
    description: "A high-level dynamically-typed programming language",
    longDescription:
      "Python is a programming language that lets you work quickly and integrate systems more effectively. It is widely used for web development, data analysis, and automation.",
    homepage: "https://www.python.org/",
    license: "PSF-2.0",
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
  },
  "legacyPackages.x86_64-linux.nodejs": {
    pname: "nodejs",
    version: "20.10.0",
    description: "Event-driven I/O framework for the V8 JavaScript engine",
    longDescription:
      "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.",
    homepage: "https://nodejs.org/",
    license: "MIT",
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
  },
  "legacyPackages.x86_64-linux.rust": {
    pname: "rust",
    version: "1.74.1",
    description: "A safe, concurrent, practical language",
    longDescription:
      "Rust is a systems programming language that runs blazingly fast, prevents segfaults, and guarantees thread safety.",
    homepage: "https://www.rust-lang.org/",
    license: "MIT OR Apache-2.0",
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
  },
  "legacyPackages.x86_64-linux.gcc": {
    pname: "gcc",
    version: "13.2.0",
    description: "GNU Compiler Collection, version 13.2.0",
    longDescription:
      "The GNU Compiler Collection includes front ends for C, C++, Objective-C, Fortran, Ada, Go, and D, as well as libraries for these languages.",
    homepage: "https://gcc.gnu.org/",
    license: "GPL-3.0-or-later",
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
  },
  "legacyPackages.x86_64-linux.firefox": {
    pname: "firefox",
    version: "121.0",
    description: "A web browser built from Firefox source tree",
    longDescription:
      "Mozilla Firefox is a free and open-source web browser developed by the Mozilla Foundation. It is available for Windows, macOS, and Linux.",
    homepage: "https://www.mozilla.org/firefox/",
    license: "MPL-2.0",
    platforms: ["x86_64-linux", "aarch64-linux"],
  },
  "legacyPackages.x86_64-linux.vscode": {
    pname: "vscode",
    version: "1.85.1",
    description: "Open source source code editor developed by Microsoft",
    longDescription:
      "Visual Studio Code is a lightweight but powerful source code editor which runs on your desktop. It comes with built-in support for JavaScript, TypeScript and Node.js.",
    homepage: "https://code.visualstudio.com/",
    license: "MIT",
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
  },
};

const MOCK_PACKAGE_DETAILS: Record<
  string,
  {
    name?: string;
    description?: string;
    longDescription?: string;
    homepage?: string;
    license?: {
      shortName?: string;
      spdxId?: string;
      fullName?: string;
      free?: boolean;
    };
    platforms?: string[];
    changelog?: string;
    mainProgram?: string;
    available?: boolean;
    broken?: boolean;
  }
> = {
  "legacyPackages.x86_64-linux.hello": {
    name: "hello-2.12.1",
    description: "A program that produces a familiar, friendly greeting",
    longDescription:
      "GNU Hello prints the message 'Hello, world!' and then exits. It serves as an example of standard GNU coding practices.",
    homepage: "https://www.gnu.org/software/hello/",
    license: {
      shortName: "gpl3Plus",
      spdxId: "GPL-3.0-or-later",
      fullName: "GNU General Public License v3.0 or later",
      free: true,
    },
    platforms: ["x86_64-linux", "aarch64-linux", "x86_64-darwin"],
    mainProgram: "hello",
    available: true,
    broken: false,
  },
  "legacyPackages.x86_64-linux.git": {
    name: "git-2.43.0",
    description: "Distributed version control system",
    longDescription:
      "Git is a free and open source distributed version control system designed to handle everything from small to very large projects with speed and efficiency.",
    homepage: "https://git-scm.com/",
    license: {
      shortName: "gpl2Only",
      spdxId: "GPL-2.0-only",
      fullName: "GNU General Public License v2.0 only",
      free: true,
    },
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
    mainProgram: "git",
    available: true,
    broken: false,
  },
  "legacyPackages.x86_64-linux.vim": {
    name: "vim-9.0.2116",
    description: "The most popular clone of the VI editor",
    longDescription:
      "Vim is a highly configurable text editor built to enable efficient text editing. It is an improved version of the vi editor distributed with most UNIX systems.",
    homepage: "https://www.vim.org/",
    license: {
      shortName: "vim",
      fullName: "Vim License",
      free: true,
    },
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
    mainProgram: "vim",
    available: true,
    broken: false,
  },
  "legacyPackages.x86_64-linux.emacs": {
    name: "emacs-29.1",
    description: "The extensible, customizable GNU text editor",
    longDescription:
      "GNU Emacs is an extensible, customizable, free text editor. At its core is an interpreter for Emacs Lisp, a dialect of the Lisp programming language.",
    homepage: "https://www.gnu.org/software/emacs/",
    license: {
      shortName: "gpl3Plus",
      spdxId: "GPL-3.0-or-later",
      fullName: "GNU General Public License v3.0 or later",
      free: true,
    },
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
    mainProgram: "emacs",
    available: true,
    broken: false,
  },
  "legacyPackages.x86_64-linux.python3": {
    name: "python3-3.11.6",
    description: "A high-level dynamically-typed programming language",
    longDescription:
      "Python is a programming language that lets you work quickly and integrate systems more effectively. It is widely used for web development, data analysis, and automation.",
    homepage: "https://www.python.org/",
    license: {
      shortName: "psfl",
      spdxId: "PSF-2.0",
      fullName: "Python Software Foundation License 2.0",
      free: true,
    },
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
    mainProgram: "python3",
    available: true,
    broken: false,
  },
  "legacyPackages.x86_64-linux.nodejs": {
    name: "nodejs-20.10.0",
    description: "Event-driven I/O framework for the V8 JavaScript engine",
    longDescription:
      "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.",
    homepage: "https://nodejs.org/",
    license: {
      shortName: "mit",
      spdxId: "MIT",
      fullName: "MIT License",
      free: true,
    },
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
    mainProgram: "node",
    available: true,
    broken: false,
  },
  "legacyPackages.x86_64-linux.rust": {
    name: "rust-1.74.1",
    description: "A safe, concurrent, practical language",
    longDescription:
      "Rust is a systems programming language that runs blazingly fast, prevents segfaults, and guarantees thread safety.",
    homepage: "https://www.rust-lang.org/",
    license: {
      shortName: "mit",
      spdxId: "MIT OR Apache-2.0",
      fullName: "MIT License",
      free: true,
    },
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
    mainProgram: "rustc",
    available: true,
    broken: false,
  },
  "legacyPackages.x86_64-linux.gcc": {
    name: "gcc-13.2.0",
    description: "GNU Compiler Collection, version 13.2.0",
    longDescription:
      "The GNU Compiler Collection includes front ends for C, C++, Objective-C, Fortran, Ada, Go, and D, as well as libraries for these languages.",
    homepage: "https://gcc.gnu.org/",
    license: {
      shortName: "gpl3Plus",
      spdxId: "GPL-3.0-or-later",
      fullName: "GNU General Public License v3.0 or later",
      free: true,
    },
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
    mainProgram: "gcc",
    available: true,
    broken: false,
  },
  "legacyPackages.x86_64-linux.firefox": {
    name: "firefox-121.0",
    description: "A web browser built from Firefox source tree",
    longDescription:
      "Mozilla Firefox is a free and open-source web browser developed by the Mozilla Foundation. It is available for Windows, macOS, and Linux.",
    homepage: "https://www.mozilla.org/firefox/",
    license: {
      shortName: "mpl20",
      spdxId: "MPL-2.0",
      fullName: "Mozilla Public License 2.0",
      free: true,
    },
    platforms: ["x86_64-linux", "aarch64-linux"],
    mainProgram: "firefox",
    available: true,
    broken: false,
  },
  "legacyPackages.x86_64-linux.vscode": {
    name: "vscode-1.85.1",
    description: "Open source source code editor developed by Microsoft",
    longDescription:
      "Visual Studio Code is a lightweight but powerful source code editor which runs on your desktop. It comes with built-in support for JavaScript, TypeScript and Node.js.",
    homepage: "https://code.visualstudio.com/",
    license: {
      shortName: "mit",
      spdxId: "MIT",
      fullName: "MIT License",
      free: true,
    },
    platforms: [
      "x86_64-linux",
      "aarch64-linux",
      "x86_64-darwin",
      "aarch64-darwin",
    ],
    mainProgram: "code",
    available: true,
    broken: false,
  },
};

const MOCK_DEPENDENCIES: Record<string, Record<string, unknown>> = {
  "legacyPackages.x86_64-linux.hello": {
    "/nix/store/c7xq1hry7mx5rxr1vqwf7dhphpd7hl29-hello-2.12.2.drv": {
      name: "hello-2.12.2",
      system: "x86_64-linux",
      builder:
        "/nix/store/f15k3dpilmiyv6zgpib289rnjykgr1r4-bash-5.3p9/bin/bash",
      args: [],
      env: {},
      inputDrvs: {
        "/nix/store/03r3ipfa69l8nla101khyw3g67j24357-bash-5.3p9.drv": {
          dynamicOutputs: {},
          outputs: ["out"],
        },
        "/nix/store/rbfgknm995x1rwpnmsn1d0c792r257hz-stdenv-linux.drv": {
          dynamicOutputs: {},
          outputs: ["out"],
        },
        "/nix/store/v8m32b0m95jpv6pza41nrw9wf8l0q2w9-version-check-hook.drv": {
          dynamicOutputs: {},
          outputs: ["out"],
        },
      },
      inputSrcs: [],
      outputs: {
        out: {
          path: "/nix/store/mi08jhbcjib1i1kgvbd0fxn2yrnzdv4a-hello-2.12.2",
        },
      },
    },
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
    if (cmd === "nix_package_detail") {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const packageKey = args?.packageKey as string;
      const detail = MOCK_PACKAGE_DETAILS[packageKey];
      if (!detail) {
        throw new Error(`Package not found: ${packageKey}`);
      }
      return JSON.stringify(detail) as T;
    }
    if (cmd === "nix_package_dependencies") {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const packageKey = args?.packageKey as string;
      const deps = MOCK_DEPENDENCIES[packageKey];
      if (!deps) {
        throw new Error(`Dependencies not found: ${packageKey}`);
      }
      return JSON.stringify(deps) as T;
    }
    throw new Error(
      "Tauri is not available. Please run 'make dev' instead of 'make dev-web' to use Tauri features.",
    );
  }

  return tauriInvoke<T>(cmd, args);
}
