import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");

  async function greet() {
    const result = await invoke<string>("greet", { name: name || "World" });
    setGreeting(result);
  }

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>
      <p>Rust + Nix Dashboard</p>
      <div>
        <input
          type="text"
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && greet()}
        />
        <button onClick={greet}>Greet</button>
      </div>
      {greeting && <div className="greeting">{greeting}</div>}
    </div>
  );
}

export default App;
