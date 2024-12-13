// Prevents additional console window on Windows in release, DO NOT REMOVE
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

use tokio::sync::Mutex;

use app_lib::client::ClientState;

use clap::Parser;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {}

#[tokio::main]
async fn main() {

    Args::parse();

    tauri::Builder::default()
        .setup(|app| {

            app.manage(Mutex::new(ClientState::new()));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            app_lib::client::connect_to_platform,
            app_lib::client::register_attribute,
            app_lib::client::publish,
            app_lib::client::disconnect_from_platform
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
