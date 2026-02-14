import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button, Heading, Text, TextField } from "@react-spectrum/s2";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");

  async function greet() {
    const result = await invoke<string>("greet", { name: name || "World" });
    setGreeting(result);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="text-center">
        <Heading level={1}>Welcome to Tauri!</Heading>
      </div>
      <div className="text-center">
        <Text>Rust + Nix Dashboard</Text>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <TextField
            aria-label="Name"
            placeholder="Enter your name..."
            value={name}
            onChange={setName}
            onKeyDown={(e) => e.key === "Enter" && greet()}
          />
        </div>
        <Button onPress={greet} variant="accent">
          Greet
        </Button>
      </div>
      {greeting && (
        <div className="text-center">
          <Text>{greeting}</Text>
        </div>
      )}
    </div>
  );
}
