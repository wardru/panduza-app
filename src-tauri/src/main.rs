#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod mqtt_handler;

use tauri::{Manager, State};
use mqtt_handler::{MqttHandler, MqttMessageType};
use std::time::Duration;
use tokio::sync::Mutex;
use rumqttc::ConnectionError;

#[tauri::command]
async fn connect(mqtt_handler_state: State<'_, Mutex<MqttHandler>>) -> Result<(), String> {

  let mut handler = mqtt_handler_state.lock().await;

  let mut rec = handler.connect("localhost", 1883).await.map_err(|e| {println!("Connection error {:?}", e.to_string()); e.to_string()})?;

  tokio::spawn(async move {
    while let Some(msg) = rec.recv().await {
      println!("msg: {msg:?}");
    }
  });

  let mdr = handler.get_message_provider();

  mdr.send(MqttMessageType::Subscribe("pza/_/structure/att".into())).await;

  Ok(())
}

#[tauri::command]
async fn disconnect(mqtt_handler_state: State<'_, Mutex<MqttHandler>>) -> Result<(), ()> {
  let mut handler = mqtt_handler_state.lock().await;

  handler.disconnect().await;
  Ok(())
}

#[tokio::main]
async fn main() {

  let handler = MqttHandler::new();

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
