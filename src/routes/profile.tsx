import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "../lib/tauri";
import { Button, Heading, Text, ProgressCircle } from "@react-spectrum/s2";
import type { NixProfileListResult } from "../types/nix";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const queryClient = useQueryClient();

  const {
    data: profileData,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["nix-profile-list"],
    queryFn: async () => {
      const resultJson = await invoke<string>("nix_profile_list");
      return JSON.parse(resultJson) as NixProfileListResult;
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (index: number) => {
      await invoke<string>("nix_profile_remove", { index });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nix-profile-list"] });
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (index?: number) => {
      await invoke<string>("nix_profile_upgrade", { index });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nix-profile-list"] });
    },
  });

  const profileEntries = profileData
    ? Object.entries(profileData.elements)
    : [];

  return (
    <div className="flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-6">
      <div className="flex-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <Heading level={1}>Installed Packages</Heading>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onPress={() => refetch()}
              isDisabled={isFetching}
            >
              Refresh
            </Button>
            <Button
              variant="accent"
              onPress={() => upgradeMutation.mutate(undefined)}
              isPending={upgradeMutation.isPending}
            >
              Upgrade All
            </Button>
          </div>
        </div>

        {isFetching && (
          <div className="flex items-center gap-3 rounded border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <ProgressCircle
              aria-label="Loading profile"
              isIndeterminate
              size="S"
            />
            <Text>Loading installed packages...</Text>
          </div>
        )}

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <Text>{String(error)}</Text>
          </div>
        )}

        {!isFetching && profileEntries.length === 0 && (
          <div className="rounded border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <Text>No packages installed in profile.</Text>
          </div>
        )}

        {!isFetching && profileEntries.length > 0 && (
          <div className="flex flex-col gap-2">
            {profileEntries.map(([packageName, element], index) => (
              <div
                key={packageName}
                className="flex items-center justify-between rounded border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex-1">
                  <div className="font-semibold">{packageName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Index: {index}
                    {!element.active && " (inactive)"}
                  </div>
                  {element.storePaths && element.storePaths.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 font-mono">
                      {element.storePaths[0]}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onPress={() => upgradeMutation.mutate(index)}
                    isPending={upgradeMutation.isPending}
                  >
                    Upgrade
                  </Button>
                  <Button
                    variant="negative"
                    onPress={() => removeMutation.mutate(index)}
                    isPending={removeMutation.isPending}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
