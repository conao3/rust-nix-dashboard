import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");

  async function greet() {
    const result = await invoke<string>("greet", { name: name || "World" });
    setGreeting(result);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-5">
      <div className="rounded-2xl bg-white/10 p-10 text-center text-white backdrop-blur-md">
        <h1 className="mb-5 text-4xl font-bold">Welcome to Tauri!</h1>
        <p className="mb-5">Rust + Nix Dashboard</p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && greet()}
            className="rounded-md border-0 px-5 py-2.5 text-base text-gray-900"
          />
          <button
            onClick={greet}
            className="rounded-md border-0 bg-indigo-500 px-8 py-2.5 text-base text-white transition-colors hover:bg-indigo-600"
          >
            Greet
          </button>
        </div>
        {greeting && <div className="mt-5 min-h-[30px] text-xl">{greeting}</div>}
      </div>
    </div>
  );
}

export default App;
