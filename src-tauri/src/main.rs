// Prevents additional console window on Windows in release, DO NOT REMOVE
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app_lib::client::ClientState;
use clap::Parser;
use tauri::Manager;
use tokio::sync::Mutex;

#[derive(Parser, Debug)]
#[command(about, long_about = None)]
struct Args {
    #[arg(short = 'V', long)]
    version: bool,
}

#[tauri::command]
fn get_build_info() -> String {
    option_env!("GIT_DESCRIBE").unwrap_or("unknown").to_string()
}

#[tokio::main]
async fn main() {
    let args = Args::parse();

    if args.version {
        let version = get_build_info();
        println!("{}", version);
        return;
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            app.manage(Mutex::new(ClientState::new()));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_build_info,
            app_lib::client::connect_to_platform,
            app_lib::client::register_attribute,
            app_lib::client::publish,
            app_lib::client::publish_file,
            app_lib::client::disconnect_from_platform
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
