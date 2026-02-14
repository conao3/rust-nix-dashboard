import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button, Heading, TextField, Text } from "@react-spectrum/s2";
import type { NixSearchResults } from "../types/nix";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NixSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const resultJson = await invoke<string>("nix_search", { query });
      const parsed = JSON.parse(resultJson) as NixSearchResults;
      setResults(parsed);
    } catch (err) {
      setError(String(err));
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4">
          <Heading level={1}>Nix Package Search</Heading>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <TextField
              aria-label="Search packages"
              placeholder="Search nixpkgs..."
              value={query}
              onChange={setQuery}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
          </div>
          <Button onPress={search} variant="accent" isDisabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <Text>{error}</Text>
          </div>
        )}
      </div>

      {results && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4">
            <Heading level={2}>Results ({Object.keys(results).length})</Heading>
          </div>
          <div className="flex flex-col gap-4">
            {Object.entries(results).map(([key, pkg]) => (
              <div
                key={key}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-1 font-mono text-sm text-gray-600 dark:text-gray-400">
                  {key}
                </div>
                <div className="mb-1 font-semibold">
                  {pkg.pname} {pkg.version}
                </div>
                {pkg.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {pkg.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
