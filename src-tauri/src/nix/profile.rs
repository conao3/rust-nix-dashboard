use std::process::Command;

pub fn nix_profile_list_sync() -> Result<String, String> {
    let output = Command::new("nix")
        .args(["profile", "list", "--json"])
        .output()
        .map_err(|e| format!("Failed to execute nix profile list: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix profile list failed: {}", stderr));
    }

    String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))
}

pub fn nix_profile_remove_sync(index: u32) -> Result<String, String> {
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

pub fn nix_profile_upgrade_sync(index: Option<u32>) -> Result<String, String> {
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

pub fn nix_profile_history_sync() -> Result<String, String> {
    let output = Command::new("nix")
        .args(["profile", "history"])
        .output()
        .map_err(|e| format!("Failed to execute nix profile history: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix profile history failed: {}", stderr));
    }

    String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))
}

pub fn nix_profile_rollback_sync() -> Result<String, String> {
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
