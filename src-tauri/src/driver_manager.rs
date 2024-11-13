use crate::mqtt_manager::{MqttCommand, MqttCommandSender, MqttMessage};
use tokio::task;
use tokio::time::timeout;
use tokio::sync::mpsc;
use std::time::Duration;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use serde_json;
use std::str;

pub struct DriverManager {
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Attribute {
    info: Option<String>,
    mode: String,
    r#type: String,
    settings: Option<serde_json::Value>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Class {
    tags: Vec<String>,
    attributes: HashMap<String, Attribute>,
    classes: HashMap<String, Class>,
    info: Option<String>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Driver {
    attributes: HashMap<String, Attribute>,
    classes: HashMap<String, Class>,
    info: Option<String>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Structure {
    driver_instances: HashMap<String, Driver>
}

impl DriverManager {
    pub fn new() -> DriverManager {
        Self {
        }
    }

    pub async fn register_platform(&self, command_sender: MqttCommandSender) -> Result<Structure, ()> {
        let (sender, mut receiver) = mpsc::channel(100);
        let _ = command_sender.send(MqttCommand::Subscribe("pza/_/structure/att".into(), sender)).await;

        let structure_msg = timeout(Duration::from_secs(1), receiver.recv()).await.map_err(|_| {
            println!("could not find a platform!");
        })?
        .ok_or_else(|| {
            println!("something bad happened to structure!");
        })?;

        let structure_msg = str::from_utf8(&structure_msg.payload).map_err(|e| {
            println!("structure was not a string");
        })?;

        let structure: Structure = serde_json::from_str(structure_msg).map_err(|e| {
            println!("structure is not valid! {:?}", e);
        })?;

        Ok(structure)
    }

}
