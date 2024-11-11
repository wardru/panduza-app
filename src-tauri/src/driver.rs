use crate::mqtt_handler::MqttMessageType;
use tokio::sync::mpsc;

pub struct Driver {
    name: String,
    message_sender: mpsc::Sender<MqttMessageType>
}

impl Driver {
    pub fn new(name: &str, message_sender: mpsc::Sender<MqttMessageType>) -> Self {
        Self {
            name: name.into(),
            message_sender: message_sender
        }
    }

    pub async fn test(&self, attribute: &str) {
        self.message_sender.send(MqttMessageType::Subscribe(format!("pza/{}/{}/att", self.name, attribute))).await;
    }
}
