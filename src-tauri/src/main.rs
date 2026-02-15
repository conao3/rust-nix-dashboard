#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use nix::sys::statvfs::statvfs;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct NixDashboardConfig {
    #[serde(skip_serializing_if = "Option::is_none")]
    system_architecture: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    nixos_rebuild: Option<NixosRebuildConfig>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NixosRebuildConfig {
    flake_path: String,
    hostname: String,
    pre_commands: Vec<String>,
    rebuild_options: Vec<String>,
    use_sudo: bool,
    use_nom: bool,
}

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

fn nix_profile_history_sync() -> Result<String, String> {
    let output = Command::new("nix")
        .args(["profile", "history"])
        .output()
        .map_err(|e| format!("Failed to execute nix profile history: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix profile history failed: {}", stderr));
    }

    let stdout =
        String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))?;

    Ok(stdout)
}

fn nix_profile_rollback_sync() -> Result<String, String> {
    let output = Command::new("nix")
        .args(["profile", "rollback"])
        .output()
        .map_err(|e| format!("Failed to execute nix profile rollback: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix profile rollback failed: {}", stderr));
    }

    Ok("Rolled back to previous generation".to_string())
}

fn nix_store_gc_sync(dry_run: bool) -> Result<String, String> {
    let mut args = vec!["store", "gc"];
    if dry_run {
        args.push("--dry-run");
    }

    let output = Command::new("nix")
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to execute nix store gc: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix store gc failed: {}", stderr));
    }

    let stdout =
        String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))?;
    let stderr =
        String::from_utf8(output.stderr).map_err(|e| format!("Failed to parse stderr: {}", e))?;

    Ok(format!("{}{}", stdout, stderr))
}

fn nix_store_optimise_sync() -> Result<String, String> {
    let output = Command::new("nix")
        .args(["store", "optimise"])
        .output()
        .map_err(|e| format!("Failed to execute nix store optimise: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix store optimise failed: {}", stderr));
    }

    let stdout =
        String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))?;
    let stderr =
        String::from_utf8(output.stderr).map_err(|e| format!("Failed to parse stderr: {}", e))?;

    Ok(format!("{}{}", stdout, stderr))
}

fn nix_store_info_sync() -> Result<String, String> {
    let output = Command::new("du")
        .args(["-sh", "/nix/store"])
        .output()
        .map_err(|e| format!("Failed to execute du: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("du failed: {}", stderr));
    }

    let stdout =
        String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))?;

    Ok(stdout)
}

fn nix_store_stats_sync() -> Result<String, String> {
    let store_path = Path::new("/nix/store");

    let stat = statvfs(store_path).map_err(|e| format!("Failed to get filesystem stats: {}", e))?;

    let block_size = stat.block_size() as u64;
    let total_blocks = stat.blocks();
    let free_blocks = stat.blocks_free();
    let used_blocks = total_blocks - free_blocks;

    let used_bytes = used_blocks * block_size;

    let entries = fs::read_dir(store_path)
        .map_err(|e| format!("Failed to read /nix/store: {}", e))?
        .count();

    Ok(serde_json::json!({
        "usedBytes": used_bytes,
        "storePathCount": entries,
    })
    .to_string())
}

fn nix_store_gc_roots_sync() -> Result<String, String> {
    let output = Command::new("nix-store")
        .args(["--gc", "--print-roots"])
        .output()
        .map_err(|e| format!("Failed to execute nix-store --gc --print-roots: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix-store --gc --print-roots failed: {}", stderr));
    }

    let stdout =
        String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))?;

    let lines: Vec<&str> = stdout.lines().collect();
    let total = lines.len();

    let mut categories: std::collections::HashMap<&str, Vec<String>> =
        std::collections::HashMap::new();

    for line in &lines {
        if let Some(root_path) = line.split(" -> ").next() {
            let category = if root_path.starts_with("/home/") && root_path.contains("/dev/") {
                "Development directories"
            } else if root_path.starts_with("/home/") && root_path.contains(".cache") {
                "Cache directories"
            } else if root_path.starts_with("/home/") && root_path.contains("home-manager") {
                "Home Manager"
            } else if root_path.starts_with("/home/")
                && root_path.contains(".local/state/nix/profiles")
            {
                "User profiles"
            } else if root_path.starts_with("/nix/var/nix/profiles") {
                "System profiles"
            } else if root_path.starts_with("/nix/var/nix/gcroots") {
                "GC roots"
            } else if root_path.starts_with("/proc/") {
                "Running processes"
            } else if root_path.starts_with("{temp:") {
                "Temporary roots"
            } else if root_path.starts_with("/run/") {
                "Runtime state"
            } else if root_path.starts_with("/home/") {
                "Home directory"
            } else {
                "Other"
            };

            categories
                .entry(category)
                .or_insert_with(Vec::new)
                .push(line.to_string());
        }
    }

    let categories_with_counts: std::collections::HashMap<&str, serde_json::Value> = categories
        .iter()
        .map(|(k, v)| {
            (
                *k,
                serde_json::json!({
                    "count": v.len(),
                    "items": v,
                }),
            )
        })
        .collect();

    let result = serde_json::json!({
        "total": total,
        "categories": categories_with_counts,
    });

    Ok(result.to_string())
}

fn get_config_path() -> Result<std::path::PathBuf, String> {
    let home_dir = std::env::var("HOME").map_err(|_| "HOME environment variable not set")?;
    let config_dir = Path::new(&home_dir).join(".config").join("nix-dashboard");
    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Failed to create config directory: {}", e))?;
    Ok(config_dir.join("config.toml"))
}

fn load_config_sync() -> Result<String, String> {
    let config_path = get_config_path()?;

    if !config_path.exists() {
        return Ok("{}".to_string());
    }

    let toml_content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let config: NixDashboardConfig =
        toml::from_str(&toml_content).map_err(|e| format!("Failed to parse TOML: {}", e))?;

    serde_json::to_string(&config).map_err(|e| format!("Failed to serialize to JSON: {}", e))
}

fn save_config_sync(config_json: &str) -> Result<String, String> {
    let config_path = get_config_path()?;

    let config: NixDashboardConfig =
        serde_json::from_str(config_json).map_err(|e| format!("Invalid JSON: {}", e))?;

    let toml_content = toml::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize to TOML: {}", e))?;

    fs::write(&config_path, toml_content)
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    Ok("Config saved successfully".to_string())
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

#[tauri::command]
async fn nix_profile_history() -> Result<String, String> {
    tokio::task::spawn_blocking(nix_profile_history_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_profile_rollback() -> Result<String, String> {
    tokio::task::spawn_blocking(nix_profile_rollback_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_store_gc(dry_run: bool) -> Result<String, String> {
    tokio::task::spawn_blocking(move || nix_store_gc_sync(dry_run))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_store_optimise() -> Result<String, String> {
    tokio::task::spawn_blocking(nix_store_optimise_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_store_info() -> Result<String, String> {
    tokio::task::spawn_blocking(nix_store_info_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_store_stats() -> Result<String, String> {
    tokio::task::spawn_blocking(nix_store_stats_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn nix_store_gc_roots() -> Result<String, String> {
    tokio::task::spawn_blocking(nix_store_gc_roots_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn load_config() -> Result<String, String> {
    tokio::task::spawn_blocking(load_config_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
async fn save_config(config_json: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || save_config_sync(&config_json))
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
            nix_profile_upgrade,
            nix_profile_history,
            nix_profile_rollback,
            nix_store_gc,
            nix_store_optimise,
            nix_store_info,
            nix_store_stats,
            nix_store_gc_roots,
            load_config,
            save_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
