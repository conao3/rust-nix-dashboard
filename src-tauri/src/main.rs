#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

fn nix_search_sync(query: &str) -> Result<String, String> {
    let output = Command::new("nix")
        .args(["search", "nixpkgs", query, "--json"])
        .output()
        .map_err(|e| format!("Failed to execute nix search: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix search failed: {}", stderr));
    }

    let stdout =
        String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))?;

    Ok(stdout)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn nix_search(query: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || nix_search_sync(&query))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, nix_search])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
