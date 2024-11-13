use rumqttc::tokio_rustls::rustls::crypto::hash::Hash;
use tokio::sync::{broadcast,mpsc};
use tokio::sync::Mutex;
use tokio::task;
use tokio::time::{timeout, sleep};
use tokio::select;

use std::sync::Arc;
use std::collections::HashMap;
use std::time::Duration;

use rumqttc::{AsyncClient, Connect, ConnectionError, Disconnect, Event, EventLoop, Incoming, MqttOptions, Outgoing, QoS, ConnectReturnCode};
use uuid::Uuid;
use bytes::Bytes;

use std::future::pending;

pub type MqttEventListener = broadcast::Receiver<MqttEvent>;
pub type MqttCommandSender = mpsc::Sender<MqttCommand>;
pub type MqttMessageSender = mpsc::Sender<MqttMessage>;

#[derive(Clone, Debug)]
pub enum MqttEvent {
    Connected(MqttCommandSender),
    Disconnected(Result<(), ()>),
}

#[derive(Clone, Debug)]
pub struct MqttMessage {
    pub topic: String,
    pub payload: Bytes
}

#[derive(Clone, Debug)]
pub enum MqttCommand {
    Disconnect,
    Publish(MqttMessage),
    Subscribe(String, MqttMessageSender)
}

pub struct MqttManager {
    event_sender: broadcast::Sender<MqttEvent>,
    command_sender: Option<MqttCommandSender>,
    connect_handle: Option<task::JoinHandle<()>>
}

impl MqttManager {
    pub fn new() -> MqttManager {
        let (event_sender, _) = broadcast::channel(100);

        Self {
            event_sender,
            command_sender: None,
            connect_handle: None,
        }
    }

    pub async fn connect(&mut self, address: String, port: u16) -> Result<(MqttCommandSender), ConnectionError> 
    {

        if self.connect_handle.is_some() {
            println!("Already connected or reconnecting. Disconnect first");
            return Err(ConnectionError::ConnectionRefused(ConnectReturnCode::NotAuthorized));
        }

        let event_sender = self.event_sender.clone();
        let mut event_receiver = event_sender.subscribe();

        let handle = tokio::spawn(Self::run(event_sender, address, port));

        let result = timeout(Duration::from_secs(1), async move {
            loop {
                let msg = event_receiver.recv().await;

                match msg {
                    Ok(MqttEvent::Connected(sender)) => {
                        return Ok(sender);
                    }
                    Ok(MqttEvent::Disconnected(_)) => {
                        return Err(());
                    }
                    Err(_) => {
                        return Err(());
                    }
                }
            }
        }).await.map_err(|_| ConnectionError::NetworkTimeout);

        if let Ok(Ok(result)) = result {
            self.command_sender = Some(result.clone());
            self.connect_handle = Some(handle);
            Ok(result)
        }
        else {
            handle.abort();
            Err(ConnectionError::NetworkTimeout)
        }
    }

    pub async fn disconnect(&mut self) {
        if let Some(sender) = &self.command_sender {
            let _ = sender.send(MqttCommand::Disconnect).await;

            self.connect_handle = None;
            self.command_sender = None;
        
        }
        else {
            println!("Already disconnected");
        }
    }

    pub async fn run(event_sender: broadcast::Sender<MqttEvent>, address: String, port: u16) {

        let mut mqtt_options = MqttOptions::new(Uuid::new_v4(), address, port);
        mqtt_options.set_keep_alive(Duration::from_secs(5));
        let (client, mut eventloop) = AsyncClient::new(mqtt_options, 100);
        let (command_sender, mut command_receiver) = mpsc::channel(100);
        let mut connected: bool = false;
        let mut first_attempt: bool = true;
        let mut allow_retry: bool = false;
        let mut dispatcher: HashMap<String, MqttMessageSender> = HashMap::new();

        loop {
            let reconnection_delay = async {
                if allow_retry {
                    tokio::time::sleep(Duration::from_secs(3)).await;
                } else {
                    pending::<()>().await;
                }
                false
            };

            tokio::select! {
               event = eventloop.poll(), if allow_retry == false => {
                    match event {
                        Ok(Event::Incoming(Incoming::ConnAck(_))) => {
                            event_sender.send(MqttEvent::Connected(command_sender.clone()));
                            first_attempt = false;
                            connected = true;
                        }
                        Ok(Event::Outgoing(Outgoing::Disconnect)) => {
                            event_sender.send(MqttEvent::Disconnected(Ok(())));
                            break;
                        }
                        Ok(Event::Incoming(Incoming::Publish(m))) => {
                            if let Some(sender) = dispatcher.get(&m.topic) {
                                println!("Got a message for topic: {}", m.topic);
                                sender.send(MqttMessage{topic: m.topic, payload: m.payload}).await;
                            }
                            else {
                                println!("could not find dispatcher for topic : {:?}", m.topic);
                            }
                        }
                        Err(e) => {
                            if connected || first_attempt {
                                event_sender.send(MqttEvent::Disconnected(Err(())));
                                connected = false;
                            }
                            else {
                                allow_retry = true;
                            }
                        }
                        _ => {}
                    }
               }
               cmd = command_receiver.recv() => {
                    match cmd {
                        Some(MqttCommand::Disconnect) => {
                            if connected == false {
                                // this means we are disconnected, but the event loop is alive, meaning a reconnection attempt is ongoing.
                                // the event loop can't react to a disconnection attempt on reconnect, so we just kill it
                                break;
                            }
                            client.disconnect().await;
                        }
                        Some(MqttCommand::Publish(msg)) => {
                            println!("cucu {msg:?}");
                            client.publish(msg.topic, QoS::AtLeastOnce, false, msg.payload).await;
                        }
                        Some(MqttCommand::Subscribe(topic, sender)) => {
                            println!("Registering a dispatcher for topic: {}", topic);
                            dispatcher.insert(topic.clone(), sender);
                            client.subscribe(topic, QoS::AtLeastOnce).await;
                        }
                        None => {}
                    }
                }
                retry = reconnection_delay => {
                    allow_retry = retry;
                }
            }
        }
    }

    pub fn get_event_listener(&self) -> MqttEventListener {
        self.event_sender.subscribe()
    }

    pub fn get_command_sender(&self) -> Option<MqttCommandSender> {
        self.command_sender.clone()
    }
}
