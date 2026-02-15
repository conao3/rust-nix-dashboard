import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import optimizeLocales from "@react-aria/optimize-locales-plugin";
import { devtools } from "@tanstack/devtools-vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    TanStackRouterVite(),
    devtools(),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
    {
      ...optimizeLocales.vite({
        locales: ["en-US", "ja-JP"],
      }),
      enforce: "pre",
    },
  ],
  clearScreen: false,
  build: {
    sourcemap: mode === "development",
  },
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
