import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { ListBox, ListBoxItem } from "react-aria-components";
import { invoke } from "../lib/tauri";
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
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm({
    defaultValues: {
      query: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.query.trim()) return;
      setSearchQuery(value.query);
    },
  });

  const {
    data: results,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["nix-search", searchQuery],
    queryFn: async () => {
      const resultJson = await invoke<string>("nix_search", {
        query: searchQuery,
      });
      return JSON.parse(resultJson) as NixSearchResults;
    },
    enabled: !!searchQuery && searchQuery.trim().length > 0,
  });

  const items = useMemo(
    () =>
      results
        ? Object.entries(results).map(([key, pkg]) => ({
            id: key,
            key,
            ...pkg,
          }))
        : [],
    [results],
  );

  return (
    <div className="flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-6">
      <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4">
          <Heading level={1}>Nix Package Search</Heading>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex gap-2"
        >
          <form.Field name="query">
            {(field) => (
              <div className="flex-1">
                <TextField
                  aria-label="Search packages"
                  placeholder="Search nixpkgs..."
                  value={field.state.value}
                  onChange={field.handleChange}
                  isDisabled={isFetching}
                />
              </div>
            )}
          </form.Field>
          <Button type="submit" variant="accent" isPending={isFetching}>
            Search
          </Button>
        </form>

        {isFetching && (
          <div className="mt-4 flex items-center gap-3 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <ProgressCircle aria-label="Searching" isIndeterminate size="S" />
            <div className="flex flex-col gap-1">
              <Text>Searching nixpkgs...</Text>
              <Text>This may take 10-30 seconds.</Text>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <Text>{String(error)}</Text>
          </div>
        )}

        {!isFetching && !results && !error && (
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

      {results && !isFetching && (
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex-none">
            <Heading level={2}>Results ({items.length})</Heading>
          </div>
          {items.length === 0 ? (
            <div className="rounded border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
              <Text>No packages found. Try a different search term.</Text>
            </div>
          ) : (
            <ListBox
              aria-label="Search results"
              items={items}
              className="flex-1 min-h-0 overflow-auto"
            >
              {(item) => (
                <ListBoxItem textValue={`${item.pname} ${item.version}`}>
                  <div className="flex flex-col gap-1 p-3">
                    <div className="font-semibold">
                      {item.pname} {item.version}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description || item.key}
                    </div>
                  </div>
                </ListBoxItem>
              )}
            </ListBox>
          )}
        </div>
      )}
    </div>
  );
}
