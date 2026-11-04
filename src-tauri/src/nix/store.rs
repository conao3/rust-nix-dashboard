use nix::sys::statvfs::statvfs;
use std::fs;
use std::path::Path;
use std::process::Command;

pub fn nix_store_gc_sync(dry_run: bool) -> Result<String, String> {
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

pub fn nix_store_optimise_sync() -> Result<String, String> {
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

pub fn nix_store_info_sync() -> Result<String, String> {
    let output = Command::new("du")
        .args(["-sh", "/nix/store"])
        .output()
        .map_err(|e| format!("Failed to execute du: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("du failed: {}", stderr));
    }

    String::from_utf8(output.stdout).map_err(|e| format!("Failed to parse output: {}", e))
}

pub fn nix_store_stats_sync() -> Result<String, String> {
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

pub fn nix_store_gc_roots_sync() -> Result<String, String> {
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
