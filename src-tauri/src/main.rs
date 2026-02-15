#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

fn nix_search_sync(query: &str, system: &str) -> Result<String, String> {
    let output = Command::new("nix")
        .args(["search", "nixpkgs", query, "--json", "--system", system])
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

fn nix_package_detail_sync(package_key: &str) -> Result<String, String> {
    let package_name = if package_key.starts_with("legacyPackages.") {
        package_key
            .split('.')
            .nth(2)
            .ok_or_else(|| format!("Invalid package key format: {}", package_key))?
    } else {
        package_key
    };

    let flake_ref = format!("nixpkgs#{}.meta", package_name);

    let output = Command::new("nix")
        .args(["eval", &flake_ref, "--json"])
        .output()
        .map_err(|e| format!("Failed to execute nix eval: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix eval failed: {}", stderr));
    }

    let stdout =
        String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))?;

    Ok(stdout)
}

fn nix_package_dependencies_sync(package_key: &str) -> Result<String, String> {
    let package_name = if package_key.starts_with("legacyPackages.") {
        package_key
            .split('.')
            .nth(2)
            .ok_or_else(|| format!("Invalid package key format: {}", package_key))?
    } else {
        package_key
    };

    let flake_ref = format!("nixpkgs#{}", package_name);

    let output = Command::new("nix")
        .args(["derivation", "show", &flake_ref])
        .output()
        .map_err(|e| format!("Failed to execute nix derivation show: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix derivation show failed: {}", stderr));
    }

    let stdout =
        String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))?;

    Ok(stdout)
}

fn nix_profile_list_sync() -> Result<String, String> {
    let output = Command::new("nix")
        .args(["profile", "list", "--json"])
        .output()
        .map_err(|e| format!("Failed to execute nix profile list: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix profile list failed: {}", stderr));
    }

    let stdout =
        String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))?;

    Ok(stdout)
}

fn nix_profile_remove_sync(index: u32) -> Result<String, String> {
    let output = Command::new("nix")
        .args(["profile", "remove", &index.to_string()])
        .output()
        .map_err(|e| format!("Failed to execute nix profile remove: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix profile remove failed: {}", stderr));
    }

    Ok("Package removed successfully".to_string())
}

fn nix_profile_upgrade_sync(index: Option<u32>) -> Result<String, String> {
    let mut args = vec!["profile", "upgrade"];
    let index_str;
    if let Some(idx) = index {
        index_str = idx.to_string();
        args.push(&index_str);
    }

    let output = Command::new("nix")
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute nix profile upgrade: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix profile upgrade failed: {}", stderr));
    }

    Ok("Package upgraded successfully".to_string())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn nix_search(query: String, system: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || nix_search_sync(&query, &system))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_package_detail(package_key: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || nix_package_detail_sync(&package_key))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_package_dependencies(package_key: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || nix_package_dependencies_sync(&package_key))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_profile_list() -> Result<String, String> {
    tokio::task::spawn_blocking(nix_profile_list_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_profile_remove(index: u32) -> Result<String, String> {
    tokio::task::spawn_blocking(move || nix_profile_remove_sync(index))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_profile_upgrade(index: Option<u32>) -> Result<String, String> {
    tokio::task::spawn_blocking(move || nix_profile_upgrade_sync(index))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            nix_search,
            nix_package_detail,
            nix_package_dependencies,
            nix_profile_list,
            nix_profile_remove,
            nix_profile_upgrade
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
