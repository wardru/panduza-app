use tauri::Manager;

use tokio::sync::Mutex;

use app_lib::client::ClientState;

#[tokio::main]
async fn main() {

    tauri::Builder::default()
        .setup(|app| {

            app.manage(Mutex::new(ClientState::new()));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            app_lib::client::connect_to_platform,
            app_lib::client::register_driver,
            app_lib::client::disconnect_from_platform
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
