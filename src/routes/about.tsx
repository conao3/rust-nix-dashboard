import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <div className="rounded-2xl bg-white/10 p-10 text-center text-white backdrop-blur-md">
      <h1 className="mb-5 text-4xl font-bold">About</h1>
      <p className="mb-3">Rust Nix Dashboard</p>
      <p className="text-sm opacity-80">
        Built with Rust, Tauri, React, TypeScript, TanStack Router, and Tailwind
        CSS
      </p>
    </div>
  );
}
