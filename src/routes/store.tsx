import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "../lib/tauri";
import { Button, Heading, Text, ProgressCircle } from "@react-spectrum/s2";
import type { NixStoreStats } from "../types/nix";
import Anser from "anser";
import { filesize } from "filesize";

export const Route = createFileRoute("/store")({
  component: Store,
});

function Store() {
  const queryClient = useQueryClient();
  const [gcOutput, setGcOutput] = useState<string>("");
  const [optimiseOutput, setOptimiseOutput] = useState<string>("");
  const [showGcRoots, setShowGcRoots] = useState(false);

  const { data: storeStats, isFetching: isFetchingStats } = useQuery({
    queryKey: ["nix-store-stats"],
    queryFn: async () => {
      const resultJson = await invoke<string>("nix_store_stats");
      return JSON.parse(resultJson) as NixStoreStats;
    },
  });

  const {
    data: gcRoots,
    isFetching: isFetchingGcRoots,
    refetch: refetchGcRoots,
  } = useQuery({
    queryKey: ["nix-store-gc-roots"],
    queryFn: async () => {
      return await invoke<string>("nix_store_gc_roots");
    },
    enabled: showGcRoots,
  });

  const gcDryRunMutation = useMutation({
    mutationFn: async () => {
      const result = await invoke<string>("nix_store_gc", { dryRun: true });
      return result;
    },
    onSuccess: (data) => {
      setGcOutput(data);
    },
  });

  const gcMutation = useMutation({
    mutationFn: async () => {
      const result = await invoke<string>("nix_store_gc", { dryRun: false });
      return result;
    },
    onSuccess: (data) => {
      setGcOutput(data);
      queryClient.invalidateQueries({ queryKey: ["nix-store-stats"] });
    },
  });

  const optimiseMutation = useMutation({
    mutationFn: async () => {
      const result = await invoke<string>("nix_store_optimise");
      return result;
    },
    onSuccess: (data) => {
      setOptimiseOutput(data);
    },
  });

  const gcOutputHtml = useMemo(() => {
    if (!gcOutput) return "";
    return Anser.ansiToHtml(gcOutput, { use_classes: false });
  }, [gcOutput]);

  const optimiseOutputHtml = useMemo(() => {
    if (!optimiseOutput) return "";
    return Anser.ansiToHtml(optimiseOutput, { use_classes: false });
  }, [optimiseOutput]);

  return (
    <div className="flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-6">
      <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Heading level={1}>Nix Store Management</Heading>
      </div>

      <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4">
          <Heading level={2}>Store Information</Heading>
        </div>
        {isFetchingStats && (
          <div className="flex items-center gap-3">
            <ProgressCircle
              aria-label="Loading store stats"
              isIndeterminate
              size="S"
            />
            <Text>Loading store information...</Text>
          </div>
        )}
        {!isFetchingStats && storeStats && (
          <div className="flex flex-col gap-3">
            <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-2 text-sm font-semibold">Disk Usage</div>
              <div className="text-2xl font-bold">
                {filesize(storeStats.usedBytes, { standard: "jedec" })}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {storeStats.usedBytes.toLocaleString()} bytes
              </div>
            </div>
            <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="mb-2 text-sm font-semibold">Store Paths</div>
              <div className="text-2xl font-bold">
                {storeStats.storePathCount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                packages in /nix/store
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <Heading level={2}>GC Roots</Heading>
          <Button
            variant="secondary"
            onPress={() => {
              setShowGcRoots(!showGcRoots);
              if (!showGcRoots) {
                refetchGcRoots();
              }
            }}
          >
            {showGcRoots ? "Hide Roots" : "Show Roots"}
          </Button>
        </div>
        <div className="mb-2">
          <Text>
            GC roots prevent store paths from being garbage collected.
          </Text>
        </div>
        {showGcRoots && (
          <div>
            {isFetchingGcRoots && (
              <div className="flex items-center gap-3 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <ProgressCircle
                  aria-label="Loading GC roots"
                  isIndeterminate
                  size="S"
                />
                <Text>Loading GC roots...</Text>
              </div>
            )}
            {!isFetchingGcRoots && gcRoots && (
              <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {gcRoots}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <Heading level={2}>Garbage Collection</Heading>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onPress={() => gcDryRunMutation.mutate()}
              isPending={gcDryRunMutation.isPending}
            >
              Preview (Dry Run)
            </Button>
            <Button
              variant="negative"
              onPress={() => gcMutation.mutate()}
              isPending={gcMutation.isPending}
            >
              Run GC
            </Button>
          </div>
        </div>
        <div className="mb-2">
          <Text>Remove unreferenced store paths to free up disk space.</Text>
        </div>
        {(gcDryRunMutation.isPending || gcMutation.isPending) && (
          <div className="flex items-center gap-3 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <ProgressCircle
              aria-label="Running garbage collection"
              isIndeterminate
              size="S"
            />
            <Text>Running garbage collection...</Text>
          </div>
        )}
        {gcOutput && (
          <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <pre
              className="whitespace-pre-wrap text-sm font-mono"
              dangerouslySetInnerHTML={{ __html: gcOutputHtml }}
            />
          </div>
        )}
      </div>

      <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <Heading level={2}>Store Optimisation</Heading>
          <Button
            variant="accent"
            onPress={() => optimiseMutation.mutate()}
            isPending={optimiseMutation.isPending}
          >
            Optimise Store
          </Button>
        </div>
        <div className="mb-2">
          <Text>
            Hard-link identical files in the store to save disk space.
          </Text>
        </div>
        {optimiseMutation.isPending && (
          <div className="flex items-center gap-3 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <ProgressCircle
              aria-label="Optimising store"
              isIndeterminate
              size="S"
            />
            <Text>Optimising store...</Text>
          </div>
        )}
        {optimiseOutput && (
          <div className="rounded border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <pre
              className="whitespace-pre-wrap text-sm font-mono"
              dangerouslySetInnerHTML={{ __html: optimiseOutputHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
