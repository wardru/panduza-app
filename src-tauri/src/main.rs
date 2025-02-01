// Prevents additional console window on Windows in release, DO NOT REMOVE
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use app_lib::client::ClientState;
use clap::Parser;
use serde_json::json;
use std::str;
use tauri::Manager;
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

static USER_SETTINGS_FNAME: &str = "settings.json";
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
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            app.manage(Mutex::new(ClientState::new()));

            println!(
                "info: user settings stored at '{}/{USER_SETTINGS_FNAME}'",
                app.app_handle().path().app_data_dir().unwrap().display()
            );

            let store = app.store(USER_SETTINGS_FNAME)?;
            let app_version = get_build_info();

            match store.get("version") {
                Some(serde_json::Value::String(store_version)) if store_version == app_version => {
                    println!("info: user settings version {} is compatible with current app version {}", store_version, app_version);
                }
                Some(serde_json::Value::String(store_version)) => {
                    println!("warning: user settings version {} may not be compatible with current app version {}", store_version, app_version);
                }
                Some(_) => println!("error: unexpected version JSON type"), // Just in case
                None => {
                    println!("warning: user settings version not found, adding version {} to user settings", app_version);
                    store.set("version", json!(get_build_info()));
                }
            }

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
