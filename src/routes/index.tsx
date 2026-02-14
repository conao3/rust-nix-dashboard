import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Button,
  Heading,
  TextField,
  Text,
  ProgressCircle,
} from "@react-spectrum/s2";
import type { NixSearchResults } from "../types/nix";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NixSearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!loading) {
      setElapsedTime(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 100);

    return () => clearInterval(interval);
  }, [loading]);

  async function search() {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

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
              onKeyDown={(e) => e.key === "Enter" && !loading && search()}
              isDisabled={loading}
            />
          </div>
          <Button onPress={search} variant="accent" isDisabled={loading}>
            Search
          </Button>
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-3 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <ProgressCircle aria-label="Searching" isIndeterminate size="S" />
            <div className="flex flex-col gap-1">
              <Text>Searching nixpkgs...</Text>
              <Text>This may take 10-30 seconds. Elapsed: {elapsedTime}s</Text>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <Text>{error}</Text>
          </div>
        )}

        {!loading && !results && !error && (
          <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-2 font-semibold">Search Tips:</div>
            <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Text>• First search may take 10-30 seconds</Text>
              <Text>• Try: "hello", "git", "python3", "vim"</Text>
              <Text>
                • Uses regex: "^python" for packages starting with python
              </Text>
            </div>
          </div>
        )}
      </div>

      {results && !loading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <Heading level={2}>Results ({Object.keys(results).length})</Heading>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Found in {elapsedTime}s
            </div>
          </div>
          {Object.keys(results).length === 0 ? (
            <div className="rounded border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <Text>No packages found. Try a different search term.</Text>
            </div>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}
