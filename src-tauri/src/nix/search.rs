use std::process::Command;

pub fn nix_search_sync(query: &str, system: &str) -> Result<String, String> {
    let output = Command::new("nix")
        .args(["search", "nixpkgs", query, "--json", "--system", system])
        .output()
        .map_err(|e| format!("Failed to execute nix search: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("nix search failed: {}", stderr));
    }

    String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))
}

pub fn nix_package_detail_sync(package_key: &str) -> Result<String, String> {
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

    String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))
}

pub fn nix_package_dependencies_sync(package_key: &str) -> Result<String, String> {
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

    String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))
}
