#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod grpc;
mod nix;

use nix::commands;

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            tauri::async_runtime::spawn(async {
                if let Err(e) = grpc::server::start_grpc_server().await {
                    eprintln!("gRPC server error: {}", e);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::nix_search,
            commands::nix_package_detail,
            commands::nix_package_dependencies,
            commands::nix_profile_list,
            commands::nix_profile_remove,
            commands::nix_profile_upgrade,
            commands::nix_profile_history,
            commands::nix_profile_rollback,
            commands::nix_store_gc,
            commands::nix_store_optimise,
            commands::nix_store_info,
            commands::nix_store_stats,
            commands::nix_store_gc_roots,
            commands::load_config,
            commands::save_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
