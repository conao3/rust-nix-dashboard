import { createFileRoute } from "@tanstack/react-router";
import { Heading, Text } from "@react-spectrum/s2";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="text-center">
        <Heading level={1}>About</Heading>
      </div>
      <div className="text-center">
        <Text>Rust Nix Dashboard</Text>
      </div>
      <div className="text-center">
        <Text>
          Built with Rust, Tauri, React, TypeScript, TanStack Router, React
          Spectrum, and Tailwind CSS
        </Text>
      </div>
    </div>
  );
}
