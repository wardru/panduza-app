pub mod mqtt_handler;

use tauri::{Manager, State};
use mqtt_handler::{MqttHandlerBuilder, MqttHandler};
use std::time::Duration;
use tokio::sync::Mutex;

#[tauri::command]
async fn connect(mqtt_handler_state: State<'_, Mutex<MqttHandler>>) -> Result<(), ()> {

  let mut handler = mqtt_handler_state.lock().await;

  handler.connect("localhost", 1883, "hello").await;
  Ok(())
}

#[tauri::command]
async fn disconnect(mqtt_handler_state: State<'_, Mutex<MqttHandler>>) -> Result<(), ()> {
  let mut handler = mqtt_handler_state.lock().await;
  
  handler.disconnect().await;
  Ok(())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut handler = MqttHandlerBuilder::new()
    .with_connection_timeout(Duration::from_secs(3))
    .build();


  tauri::Builder::default()
    .setup(|app| {
      app.manage(Mutex::new(handler));
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      connect,
      disconnect
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
