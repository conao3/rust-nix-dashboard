import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { ListBox, ListBoxItem } from "react-aria-components";
import { invoke } from "../lib/tauri";
import {
  ActionButton,
  Button,
  Heading,
  TextField,
  Text,
  ProgressCircle,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TooltipTrigger,
  Tooltip,
} from "@react-spectrum/s2";
import Copy from "@react-spectrum/s2/icons/Copy";
import Checkmark from "@react-spectrum/s2/icons/Checkmark";
import { clsx } from "clsx";
import * as z from "zod";
import type { NixSearchResults, NixPackageDetail } from "../types/nix";

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
            <ListBoxItem
              textValue={`${item.pname} ${item.version}`}
              className="cursor-pointer rounded rac-selected:bg-blue-100 rac-selected:dark:bg-blue-900 rac-hovered:bg-gray-100 rac-hovered:dark:bg-gray-800"
            >
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
  packageKey: string;
  pname: string;
  version: string;
  description?: string;
  onClose: () => void;
};

type CopyButtonProps = {
  command: string;
};

function CopyButton(props: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(props.command);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <TooltipTrigger>
      <ActionButton aria-label="Copy" onPress={copyToClipboard}>
        <div className="relative inline-flex h-5 w-5 items-center justify-center">
          <div
            className={clsx("absolute transition-all duration-200", {
              "scale-0 opacity-0": copied,
              "scale-100 opacity-100": !copied,
            })}
          >
            <Copy />
          </div>
          <div
            className={clsx("absolute transition-all duration-200", {
              "scale-100 opacity-100": copied,
              "scale-0 opacity-0": !copied,
            })}
          >
            <Checkmark />
          </div>
        </div>
      </ActionButton>
      <Tooltip>Copy</Tooltip>
    </TooltipTrigger>
  );
}

function PackageDetail(props: PackageDetailProps) {
  const { data: detail, isFetching } = useQuery({
    queryKey: ["nix-package-detail", props.packageKey],
    queryFn: async () => {
      const resultJson = await invoke<string>("nix_package_detail", {
        packageKey: props.packageKey,
      });
      return JSON.parse(resultJson) as NixPackageDetail;
    },
  });

  const packageName = props.packageKey.split(".").pop() || props.pname;

  const commands = {
    profile: `nix profile install nixpkgs#${packageName}`,
    nixos: `environment.systemPackages = [ pkgs.${packageName} ];`,
    shell: `nix-shell -p ${packageName}`,
    env: `nix-env -iA nixpkgs.${packageName}`,
  };

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
            {props.pname} {props.version}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {props.packageKey}
          </div>
        </div>
        {isFetching && (
          <div className="flex items-center gap-3">
            <ProgressCircle
              aria-label="Loading details"
              isIndeterminate
              size="S"
            />
            <Text UNSAFE_className="text-sm text-gray-600 dark:text-gray-400">
              Loading additional details...
            </Text>
          </div>
        )}
        {!isFetching && (
          <div className="flex flex-col gap-4">
            {detail &&
              (detail.broken ||
                detail.insecure ||
                detail.unfree ||
                detail.unsupported) && (
                <div className="flex flex-wrap gap-2">
                  {detail.broken && (
                    <span className="rounded bg-red-200 px-2 py-1 text-xs font-semibold text-red-900 dark:bg-red-900 dark:text-red-100">
                      Broken
                    </span>
                  )}
                  {detail.insecure && (
                    <span className="rounded bg-orange-200 px-2 py-1 text-xs font-semibold text-orange-900 dark:bg-orange-900 dark:text-orange-100">
                      Insecure
                    </span>
                  )}
                  {detail.unfree && (
                    <span className="rounded bg-yellow-200 px-2 py-1 text-xs font-semibold text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100">
                      Unfree
                    </span>
                  )}
                  {detail.unsupported && (
                    <span className="rounded bg-gray-300 px-2 py-1 text-xs font-semibold text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                      Unsupported
                    </span>
                  )}
                </div>
              )}
            <div>
              <div className="text-sm font-semibold mb-1">Description</div>
              {detail?.description || props.description ? (
                <Text>{detail?.description || props.description}</Text>
              ) : (
                <Text UNSAFE_className="text-sm italic text-gray-400 dark:text-gray-600">
                  Not available
                </Text>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">Long Description</div>
              {detail?.longDescription ? (
                <Text>{detail.longDescription}</Text>
              ) : (
                <Text UNSAFE_className="text-sm italic text-gray-400 dark:text-gray-600">
                  Not available
                </Text>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">Main Program</div>
              {detail?.mainProgram ? (
                <code className="rounded bg-gray-100 px-2 py-1 text-sm dark:bg-gray-800">
                  {detail.mainProgram}
                </code>
              ) : (
                <Text UNSAFE_className="text-sm italic text-gray-400 dark:text-gray-600">
                  Not available
                </Text>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">Homepage</div>
              {detail?.homepage ? (
                <a
                  href={detail.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {detail.homepage}
                </a>
              ) : (
                <Text UNSAFE_className="text-sm italic text-gray-400 dark:text-gray-600">
                  Not available
                </Text>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">Changelog</div>
              {detail?.changelog ? (
                <a
                  href={detail.changelog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {detail.changelog}
                </a>
              ) : (
                <Text UNSAFE_className="text-sm italic text-gray-400 dark:text-gray-600">
                  Not available
                </Text>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">License</div>
              {detail?.license ? (
                <div className="flex flex-col gap-1">
                  {detail.license.fullName ? (
                    <Text>{detail.license.fullName}</Text>
                  ) : (
                    <Text UNSAFE_className="text-sm italic text-gray-400 dark:text-gray-600">
                      Not available
                    </Text>
                  )}
                  {detail.license.spdxId && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      SPDX: {detail.license.spdxId}
                    </div>
                  )}
                  {detail.license.free !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      {detail.license.free ? (
                        <span className="rounded bg-green-200 px-2 py-1 text-xs dark:bg-green-700">
                          Free Software
                        </span>
                      ) : (
                        <span className="rounded bg-orange-200 px-2 py-1 text-xs dark:bg-orange-700">
                          Non-Free
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Text UNSAFE_className="text-sm italic text-gray-400 dark:text-gray-600">
                  Not available
                </Text>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">Platforms</div>
              {detail?.platforms && detail.platforms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {detail.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              ) : (
                <Text UNSAFE_className="text-sm italic text-gray-400 dark:text-gray-600">
                  Not available
                </Text>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold mb-2">Install Commands</div>
              <Tabs defaultSelectedKey="profile" aria-label="Install methods">
                <TabList>
                  <Tab id="profile">nix profile</Tab>
                  <Tab id="nixos">NixOS Config</Tab>
                  <Tab id="shell">nix-shell</Tab>
                  <Tab id="env">nix-env</Tab>
                </TabList>
                <TabPanel id="profile">
                  <div className="flex items-center gap-2 pt-3">
                    <code className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
                      {commands.profile}
                    </code>
                    <CopyButton command={commands.profile} />
                  </div>
                </TabPanel>
                <TabPanel id="nixos">
                  <div className="flex items-center gap-2 pt-3">
                    <code className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
                      {commands.nixos}
                    </code>
                    <CopyButton command={commands.nixos} />
                  </div>
                </TabPanel>
                <TabPanel id="shell">
                  <div className="flex items-center gap-2 pt-3">
                    <code className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
                      {commands.shell}
                    </code>
                    <CopyButton command={commands.shell} />
                  </div>
                </TabPanel>
                <TabPanel id="env">
                  <div className="flex items-center gap-2 pt-3">
                    <code className="flex-1 rounded bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
                      {commands.env}
                    </code>
                    <CopyButton command={commands.env} />
                  </div>
                </TabPanel>
              </Tabs>
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
              packageKey={selectedItem.key}
              pname={selectedItem.pname}
              version={selectedItem.version}
              description={selectedItem.description}
              onClose={() => setSelectedKey(undefined)}
            />
          )}
        </div>
      )}
    </div>
  );
}
