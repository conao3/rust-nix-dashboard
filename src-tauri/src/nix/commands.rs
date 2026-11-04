use super::config;
use super::profile;
use super::search;
use super::store;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
pub async fn nix_search(query: String, system: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || search::nix_search_sync(&query, &system))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_package_detail(package_key: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || search::nix_package_detail_sync(&package_key))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_package_dependencies(package_key: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || search::nix_package_dependencies_sync(&package_key))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_profile_list() -> Result<String, String> {
    tokio::task::spawn_blocking(profile::nix_profile_list_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_profile_remove(index: u32) -> Result<String, String> {
    tokio::task::spawn_blocking(move || profile::nix_profile_remove_sync(index))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_profile_upgrade(index: Option<u32>) -> Result<String, String> {
    tokio::task::spawn_blocking(move || profile::nix_profile_upgrade_sync(index))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_profile_history() -> Result<String, String> {
    tokio::task::spawn_blocking(profile::nix_profile_history_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_profile_rollback() -> Result<String, String> {
    tokio::task::spawn_blocking(profile::nix_profile_rollback_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_store_gc(dry_run: bool) -> Result<String, String> {
    tokio::task::spawn_blocking(move || store::nix_store_gc_sync(dry_run))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_store_optimise() -> Result<String, String> {
    tokio::task::spawn_blocking(store::nix_store_optimise_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_store_info() -> Result<String, String> {
    tokio::task::spawn_blocking(store::nix_store_info_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_store_stats() -> Result<String, String> {
    tokio::task::spawn_blocking(store::nix_store_stats_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn nix_store_gc_roots() -> Result<String, String> {
    tokio::task::spawn_blocking(store::nix_store_gc_roots_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn load_config() -> Result<String, String> {
    tokio::task::spawn_blocking(config::load_config_sync)
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}

#[tauri::command]
pub async fn save_config(config_json: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || config::save_config_sync(&config_json))
        .await
        .map_err(|e| format!("Task join error: {}", e))?
}
