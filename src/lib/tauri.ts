import { invoke as tauriInvoke } from "@tauri-apps/api/core";

export async function invoke<T>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  if (!("__TAURI_INTERNALS__" in window)) {
    throw new Error(
      "Tauri is not available. Please run 'make dev' instead of 'make dev-web' to use Tauri features.",
    );
  }

  return tauriInvoke<T>(cmd, args);
}
