import { invoke } from "@tauri-apps/api/core";

window.greet = async function() {
  const nameInput = document.getElementById("name-input");
  const greetingEl = document.getElementById("greeting");
  const name = nameInput.value || "World";

  try {
    const greeting = await invoke("greet", { name });
    greetingEl.textContent = greeting;
  } catch (error) {
    greetingEl.textContent = "Error: " + error;
  }
};

document.getElementById("name-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    greet();
  }
});
