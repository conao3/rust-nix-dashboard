import { createFileRoute } from "@tanstack/react-router";
import { Heading, Text } from "@react-spectrum/s2";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="text-center">
        <Heading level={1}>About</Heading>
      </div>
      <div className="text-center">
        <Text>Rust Nix Dashboard</Text>
      </div>
      <div className="text-center">
        <Text>A GUI frontend for the Nix package manager</Text>
      </div>
      <div className="mt-4">
        <Heading level={2}>Features</Heading>
      </div>
      <div>
        <Text>• Package Search - Search nixpkgs repository</Text>
        <Text>• More features coming soon...</Text>
      </div>
      <div className="mt-4">
        <Heading level={2}>Built With</Heading>
      </div>
      <div className="text-sm">
        <Text>
          Rust, Tauri, React, TypeScript, TanStack Router, React Spectrum, and
          Tailwind CSS
        </Text>
      </div>
    </div>
  );
}
