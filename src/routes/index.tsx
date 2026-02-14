import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { ListBox, ListBoxItem } from "react-aria-components";
import { invoke } from "../lib/tauri";
import {
  Button,
  Heading,
  TextField,
  Text,
  ProgressCircle,
} from "@react-spectrum/s2";
import * as z from "zod";
import type { NixSearchResults } from "../types/nix";

export const Route = createFileRoute("/")({
  component: Index,
});

const searchForm = z.object({
  query: z.string().min(1),
});

type SearchForm = z.infer<typeof searchForm>;

const searchFormDefaultValue = {
  query: "",
};

type SearchFormProps = {
  onSearch: (query: string) => void;
  isFetching: boolean;
};

type PackageListProps = {
  items: Array<{
    id: string;
    key: string;
    pname: string;
    version: string;
    description?: string;
  }>;
  selectedKey: string | undefined;
  onSelectionChange: (key: string | undefined) => void;
};

function PackageList(props: PackageListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex-none">
        <Heading level={2}>Results ({props.items.length})</Heading>
      </div>
      {props.items.length === 0 ? (
        <div className="rounded border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <Text>No packages found. Try a different search term.</Text>
        </div>
      ) : (
        <ListBox
          aria-label="Search results"
          items={props.items}
          selectionMode="single"
          selectedKeys={props.selectedKey ? [props.selectedKey] : []}
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0];
            if (key) {
              props.onSelectionChange(String(key));
            }
          }}
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
  );
}

type PackageDetailProps = {
  item: {
    id: string;
    key: string;
    pname: string;
    version: string;
    description?: string;
    longDescription?: string;
    homepage?: string;
    license?: string;
    platforms?: string[];
  };
  onClose: () => void;
};

function PackageDetail(props: PackageDetailProps) {
  return (
    <div className="w-96 flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <Heading level={2}>Details</Heading>
        <Button
          variant="secondary"
          onPress={props.onClose}
          aria-label="Close details"
        >
          ✕
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <div className="text-lg font-semibold">
            {props.item.pname} {props.item.version}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {props.item.key}
          </div>
        </div>
        {props.item.description && (
          <div>
            <div className="text-sm font-semibold mb-1">Description</div>
            <Text>{props.item.description}</Text>
          </div>
        )}
        {props.item.longDescription && (
          <div>
            <div className="text-sm font-semibold mb-1">Long Description</div>
            <Text>{props.item.longDescription}</Text>
          </div>
        )}
        {props.item.homepage && (
          <div>
            <div className="text-sm font-semibold mb-1">Homepage</div>
            <a
              href={props.item.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {props.item.homepage}
            </a>
          </div>
        )}
        {props.item.license && (
          <div>
            <div className="text-sm font-semibold mb-1">License</div>
            <Text>{props.item.license}</Text>
          </div>
        )}
        {props.item.platforms && props.item.platforms.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-1">Platforms</div>
            <div className="flex flex-wrap gap-2">
              {props.item.platforms.map((platform) => (
                <span
                  key={platform}
                  className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchForm(props: SearchFormProps) {
  const form = useForm({
    defaultValues: searchFormDefaultValue,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: searchForm,
    },
    onSubmit: async ({ value }) => {
      if (!value.query.trim()) return;
      props.onSearch(value.query);
    },
  });

  return (
    <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4">
        <Heading level={1}>Nix Package Search</Heading>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex gap-2 items-start"
      >
        <form.Field
          name="query"
          validators={{
            onDynamic: searchForm.shape.query,
          }}
        >
          {(field) => (
            <div className="flex-1">
              <TextField
                aria-label="Search packages"
                placeholder="Search nixpkgs..."
                value={field.state.value}
                onChange={field.handleChange}
                isInvalid={!field.state.meta.isValid}
                errorMessage={field.state.meta.errors
                  .map((e) => e?.message)
                  .join(", ")}
              />
            </div>
          )}
        </form.Field>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="accent"
              isDisabled={!canSubmit}
              isPending={props.isFetching || isSubmitting}
            >
              Search
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}

function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | undefined>();

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

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedKey) || null,
    [items, selectedKey],
  );

  return (
    <div className="flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-6">
      <SearchForm onSearch={setSearchQuery} isFetching={isFetching} />

      {isFetching && (
        <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <ProgressCircle aria-label="Searching" isIndeterminate size="S" />
            <div className="flex flex-col gap-1">
              <Text>Searching nixpkgs...</Text>
              <Text>This may take 10-30 seconds.</Text>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <Text>{String(error)}</Text>
          </div>
        </div>
      )}

      {!isFetching && !results && !error && (
        <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-2 font-semibold">Search Tips:</div>
            <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Text>• First search may take 10-30 seconds</Text>
              <Text>• Try: "hello", "git", "python3", "vim"</Text>
              <Text>
                • Uses regex: "^python" for packages starting with python
              </Text>
            </div>
          </div>
        </div>
      )}

      {results && !isFetching && (
        <div className="flex min-h-0 flex-1 gap-6">
          <PackageList
            items={items}
            selectedKey={selectedKey}
            onSelectionChange={setSelectedKey}
          />
          {selectedItem && (
            <PackageDetail
              item={selectedItem}
              onClose={() => setSelectedKey(undefined)}
            />
          )}
        </div>
      )}
    </div>
  );
}
