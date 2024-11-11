use crate::mqtt_handler::MqttMessageType;
use tokio::sync::mpsc;

pub struct Driver {
    _name: String,
    _message_sender: mpsc::Sender<MqttMessageType>
}

impl Driver {
    pub fn new(name: &str, message_sender: mpsc::Sender<MqttMessageType>) -> Self {
        Self {
            _name: name.into(),
            _message_sender: message_sender
        }
    }
}
