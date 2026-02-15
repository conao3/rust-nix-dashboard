import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "../lib/tauri";
import {
  Button,
  Heading,
  Text,
  TextField,
  Checkbox,
  ProgressCircle,
} from "@react-spectrum/s2";
import type { NixDashboardConfig } from "../types/config";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const queryClient = useQueryClient();
  const [flakePath, setFlakePath] = useState("");
  const [hostname, setHostname] = useState("");
  const [preCommands, setPreCommands] = useState("");
  const [rebuildOptions, setRebuildOptions] = useState("");
  const [useSudo, setUseSudo] = useState(true);
  const [useNom, setUseNom] = useState(true);

  const { data: configData, isFetching } = useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const resultJson = await invoke<string>("load_config");
      return JSON.parse(resultJson) as NixDashboardConfig;
    },
  });

  useEffect(() => {
    if (configData?.nixosRebuild) {
      setFlakePath(configData.nixosRebuild.flakePath || "");
      setHostname(configData.nixosRebuild.hostname || "");
      setPreCommands(configData.nixosRebuild.preCommands?.join("\n") || "");
      setRebuildOptions(
        configData.nixosRebuild.rebuildOptions?.join(" ") || "",
      );
      setUseSudo(configData.nixosRebuild.useSudo ?? true);
      setUseNom(configData.nixosRebuild.useNom ?? true);
    }
  }, [configData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const config: NixDashboardConfig = {
        systemArchitecture: configData?.systemArchitecture,
        nixosRebuild: {
          flakePath,
          hostname,
          preCommands: preCommands
            .split("\n")
            .map((cmd) => cmd.trim())
            .filter((cmd) => cmd.length > 0),
          rebuildOptions: rebuildOptions
            .split(" ")
            .map((opt) => opt.trim())
            .filter((opt) => opt.length > 0),
          useSudo,
          useNom,
        },
      };
      await invoke<string>("save_config", {
        configJson: JSON.stringify(config, null, 2),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });

  return (
    <div className="flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-6">
      <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Heading level={1}>Settings</Heading>
      </div>

      {isFetching && (
        <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <ProgressCircle
              aria-label="Loading settings"
              isIndeterminate
              size="S"
            />
            <Text>Loading settings...</Text>
          </div>
        </div>
      )}

      {!isFetching && (
        <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4">
            <Heading level={2}>NixOS Rebuild Configuration</Heading>
          </div>

          <div className="flex flex-col gap-4">
            <TextField
              label="Flake Path"
              value={flakePath}
              onChange={setFlakePath}
              placeholder="~/dev/repos/nixos-configuration"
            />

            <TextField
              label="Hostname"
              value={hostname}
              onChange={setHostname}
              placeholder="conao-nixos-helios"
            />

            <TextField
              label="Pre-build Commands (one per line)"
              value={preCommands}
              onChange={setPreCommands}
              placeholder="nix flake update&#10;git add ."
            />

            <TextField
              label="Rebuild Options (space-separated)"
              value={rebuildOptions}
              onChange={setRebuildOptions}
              placeholder="--log-format internal-json -v --show-trace"
            />

            <div className="flex flex-col gap-2">
              <Checkbox isSelected={useSudo} onChange={setUseSudo}>
                Use sudo
              </Checkbox>
              <Checkbox isSelected={useNom} onChange={setUseNom}>
                Use nom for output formatting
              </Checkbox>
            </div>

            <div className="flex justify-end">
              <Button
                variant="accent"
                onPress={() => saveMutation.mutate()}
                isPending={saveMutation.isPending}
              >
                Save Configuration
              </Button>
            </div>

            {saveMutation.isSuccess && (
              <div className="rounded border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                <Text>Configuration saved successfully!</Text>
              </div>
            )}

            {saveMutation.isError && (
              <div className="rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <Text>
                  Failed to save configuration:{" "}
                  {saveMutation.error instanceof Error
                    ? saveMutation.error.message
                    : "Unknown error"}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
