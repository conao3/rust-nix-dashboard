use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NixDashboardConfig {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system_architecture: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nixos_rebuild: Option<NixosRebuildConfig>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NixosRebuildConfig {
    pub flake_path: String,
    pub hostname: String,
    pub pre_commands: Vec<String>,
    pub rebuild_options: Vec<String>,
    pub use_sudo: bool,
    pub use_nom: bool,
}

fn get_config_path() -> Result<std::path::PathBuf, String> {
    let home_dir = std::env::var("HOME").map_err(|_| "HOME environment variable not set")?;
    let config_dir = Path::new(&home_dir).join(".config").join("nix-dashboard");
    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Failed to create config directory: {}", e))?;
    Ok(config_dir.join("config.toml"))
}

pub fn load_config_sync() -> Result<String, String> {
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

pub fn save_config_sync(config_json: &str) -> Result<String, String> {
    let config_path = get_config_path()?;

    let config: NixDashboardConfig =
        serde_json::from_str(config_json).map_err(|e| format!("Invalid JSON: {}", e))?;

    let toml_content = toml::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize to TOML: {}", e))?;

    fs::write(&config_path, toml_content)
        .map_err(|e| format!("Failed to write config file: {}", e))?;

    Ok("Config saved successfully".to_string())
}
