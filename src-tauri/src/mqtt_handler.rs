use rumqttc::{AsyncClient, Event, EventLoop, Incoming, MqttOptions};
use std::time::Duration;
use tokio::{sync::mpsc, task, time, time::timeout};

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ConnState {
    Connected,
    Disconnected,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Message {
    NewState(ConnState),
    Publish(String)
}

pub struct MqttHandlerBuilder {
    connection_timeout: std::time::Duration,
}

impl MqttHandlerBuilder {
    pub fn new() -> MqttHandlerBuilder {
        Self {
            connection_timeout: Duration::from_secs(5),
        }
    }

    pub fn with_connection_timeout(mut self, timeout: std::time::Duration) -> MqttHandlerBuilder {
        self.connection_timeout = timeout;
        self
    }

    pub fn build(&self) -> MqttHandler {
        MqttHandler {
            connection_state: ConnState::Disconnected,
            rumqtt_client: None,
            connection_timeout: self.connection_timeout,
            receiver: None 
        }
    }
}

pub struct MqttHandler {
    connection_state: ConnState,
    rumqtt_client: Option<AsyncClient>,
    connection_timeout: std::time::Duration,
    receiver: Option<mpsc::Receiver<Message>>
}

impl MqttHandler {
    pub async fn connect<T>(
        &mut self,
        address: T,
        port: u16,
        id: T,
    ) -> Result<(), rumqttc::ConnectionError>
    where
        T: Into<String>,
    {
        let mqtt_options = MqttOptions::new(id, address, port);
        let (client, mut event_loop) = AsyncClient::new(mqtt_options, 100);
        let (tx, mut rx) = mpsc::channel(100);
        let _event_loop_handle = task::spawn(async move {
            loop {
                let event = event_loop.poll().await;

                match event {
                    Ok(Event::Incoming(Incoming::ConnAck(v))) => {
                        println!("hello {v:?}");
                        let _ = tx.send(Message::NewState(ConnState::Connected)).await;
                    }
                    Ok(v) => {
                        println!("hoy {v:?}");
                        let _ = tx.send(Message::NewState(ConnState::Disconnected));
                    }
                    Err(e) => {
                        let _ = tx.send(Message::NewState(ConnState::Disconnected));
                        println!("mdr {e:?}");
                        time::sleep(Duration::from_secs(1)).await;
                    }
                }
            }
        });

        let result = timeout(self.connection_timeout, async {
            while let Some(message) = rx.recv().await {
                if message == Message::NewState(ConnState::Connected) {
                    return Ok(message);
                }
            }
            Err("efe")
        }).await;

        println!("res: {result:?}");

        self.rumqtt_client = Some(client);
        self.receiver = Some(rx);

        Ok(())
    }

    pub async fn disconnect(&self) -> Result<(), rumqttc::ClientError> {
        if let Some(client) = &self.rumqtt_client {
            client.disconnect().await?
        }
        else {
            println!("Called disconnect on not connected client.");
        }
        Ok(())
    }
}
