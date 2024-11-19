#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod mqtt_manager;
pub mod driver_manager;
//pub mod driver;

use driver_manager::DriverManager;
use tauri::{Manager, State, AppHandle, Emitter};
use mqtt_manager::{MqttCommand, MqttManager, MqttMessage};
use tokio::sync::Mutex;

#[tauri::command]
async fn connect(mqtt_handler_state: State<'_, Mutex<MqttManager>>, app: AppHandle) -> Result<(), String> {

  let mut handler = mqtt_handler_state.lock().await;

  let command_sender = handler.connect("localhost".into(), 1883).await.map_err(|_| "failed!")?;

  let driver_manager = DriverManager::new();

  let structure = driver_manager.register_platform(command_sender.clone()).await.unwrap();

  println!("coucouu");

  let _ = app.emit("connect", "true").unwrap();

  let _ = app.emit("structure", &structure).unwrap();

   let (sender, mut receiver) = tokio::sync::mpsc::channel(100);

   command_sender.send(mqtt_manager::MqttCommand::Subscribe("pza/my_psu/identity/att".into(), sender)).await;

   while let Some(msg) = receiver.recv().await {
        let str:&str = std::str::from_utf8(&msg.payload).unwrap();
       app.emit("pza/my_psu/identity", str).unwrap();
       break ;
   }

   let (sender, mut receiver) = tokio::sync::mpsc::channel(100);


   command_sender.send(mqtt_manager::MqttCommand::Subscribe("pza/my_psu/control/voltage/att".into(), sender)).await;

   while let Some(msg) = receiver.recv().await {
      let number = std::str::from_utf8(&msg.payload).unwrap();
      let number = number.parse::<f64>().unwrap();
      println!("number: {:?}", number);
       app.emit("pza/my_psu/control/voltage", number).unwrap();
       break ;
   }


   let (sender, mut receiver) = tokio::sync::mpsc::channel(100);


   command_sender.send(mqtt_manager::MqttCommand::Subscribe("pza/my_psu/control/current/att".into(), sender)).await;

   while let Some(msg) = receiver.recv().await {
      let number = std::str::from_utf8(&msg.payload).unwrap();
      let number = number.parse::<f64>().unwrap();
      println!("number: {:?}", number);
       app.emit("pza/my_psu/control/current", number).unwrap();
       break ;
   }

  Ok(())
}

#[tauri::command]
async fn disconnect(mqtt_handler_state: State<'_, Mutex<MqttManager>>, app: AppHandle) -> Result<(), ()> {
  let mut handler = mqtt_handler_state.lock().await;

  handler.disconnect().await;
  let _ = app.emit("connect", "false").unwrap();
  Ok(())
}

#[tauri::command]
async fn new_value(topic: String, value: f64, mqtt_handler_state: State<'_, Mutex<MqttManager>>, app: AppHandle) -> Result<(), ()> {
  let mut handler = mqtt_handler_state.lock().await;

  let sender = handler.get_command_sender().unwrap();

  println!("Ok so you want to send: {topic:?} : {value:?}");

  sender.send(MqttCommand::Publish(MqttMessage {
    topic: topic+"/cmd",
    payload: value.to_string().into_bytes().into()
  })).await;

  Ok(())
}

#[tokio::main]
async fn main() {
   tauri::Builder::default()
    .setup(|app| {

      
      let mqtt_manager = MqttManager::new();
      let driver_manager = DriverManager::new();

      app.manage(Mutex::new(mqtt_manager));
      app.manage(Mutex::new(driver_manager));
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      connect,
      disconnect,
      new_value
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
