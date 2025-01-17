use std::time::Duration;

use bytes::Bytes;
use rumqttc::{AsyncClient, Event, EventLoop, Incoming, MqttOptions, QoS};
use uuid::Uuid;

use tokio::sync::oneshot;
use tokio::sync::Mutex;
use tokio::time;

use futures::future;

use futures::future::FutureExt;

use std::sync::Arc;

use std::collections::HashMap;

use serde::Serialize;
use tauri::{ipc::Channel, State};

pub struct ShutdownRequest;

#[derive(Clone, Serialize)]
pub struct MqttMessage {
    topic: String,
    payload: Bytes,
}

#[derive(Clone, Serialize, PartialEq)]
pub enum ConnectionState {
    Connected,
    Reconnecting,
    Disconnected,
}

struct Mqtt {
    client: AsyncClient,
    event_loop: EventLoop,

    network_status: Arc<Mutex<ConnectionState>>,
    dispatcher_map: Arc<Mutex<HashMap<String, Channel<Bytes>>>>,

    event_sender: Channel<ConnectionState>,

    shutdown_rx: oneshot::Receiver<ShutdownRequest>,
}

impl Mqtt {
    fn new(
        mut address: &str,
        port: u16,
        network_status: Arc<Mutex<ConnectionState>>,
        dispatcher_map: Arc<Mutex<HashMap<String, Channel<Bytes>>>>,
        event_sender: Channel<ConnectionState>,
    ) -> (Mqtt, oneshot::Sender<ShutdownRequest>) {
        // Translating localhost to 127.0.0.1 due to DNS conflicts on Windows
        if cfg!(windows) && address == "localhost" {
            address = "127.0.0.1";
        }

        let client_id = Uuid::new_v4();
        let mqtt_options = MqttOptions::new(client_id, address, port);
        let (client, event_loop) = AsyncClient::new(mqtt_options, 100);
        let (shutdown_tx, shutdown_rx) = oneshot::channel();

        let client = Mqtt {
            client,
            event_loop,
            network_status,

            dispatcher_map,
            event_sender,

            shutdown_rx,
        };

        (client, shutdown_tx)
    }

    fn get_client(&self) -> AsyncClient {
        self.client.clone()
    }

    async fn try_connect(&mut self) -> Result<(), String> {
        let event = self.event_loop.poll().await;

        match event {
            Ok(Event::Incoming(Incoming::ConnAck(_))) => Ok(()),
            Err(e) => Err(e.to_string()),
            _ => Err("Unknown error".into()),
        }
    }

    async fn start(mut self) {
        let mut shutdown_rx = self.shutdown_rx.fuse();
        let mut need_retry_timeout: bool = false;

        loop {
            tokio::select! {
                event = self.event_loop.poll(), if !need_retry_timeout => {
                    match event {
                        Ok(Event::Incoming(Incoming::ConnAck(_))) => {
                            *self.network_status.lock().await = ConnectionState::Connected;
                            let _ = self.event_sender.send(ConnectionState::Connected);
                        }
                        Ok(Event::Incoming(Incoming::Publish(m))) => {
                            if let Some(sender) = self.dispatcher_map.lock().await.get(&m.topic) {
                                println!("Got message:\n\t[Topic]: {}\n\t[Payload]: {:?}\n", m.topic, m.payload);
                                let _ = sender.send(m.payload);
                            }
                        }
                        Err(_) => {
                            *self.network_status.lock().await = ConnectionState::Reconnecting;
                            let _ = self.event_sender.send(ConnectionState::Reconnecting);
                            need_retry_timeout = true;
                        }
                        _ => {}
                    }
                }

                _ = &mut shutdown_rx => {
                    *self.network_status.lock().await = ConnectionState::Disconnected;
                    println!("Disconnected!");
                    break ;
                }

                _ = async {
                    if need_retry_timeout {
                        time::sleep(Duration::from_secs(3)).await;
                        need_retry_timeout = false;
                    }
                    else {
                        future::pending::<()>().await;
                    }
                } => {}
            }
        }
    }
}

pub struct ClientState {
    mqtt_client: Option<AsyncClient>,
    shutdown_tx: Option<oneshot::Sender<ShutdownRequest>>,

    network_status: Arc<Mutex<ConnectionState>>,
    dispatcher_map: Arc<Mutex<HashMap<String, Channel<Bytes>>>>,
}

impl Default for ClientState {
    fn default() -> Self {
        Self::new()
    }
}

impl ClientState {
    pub fn new() -> ClientState {
        Self {
            mqtt_client: None,
            shutdown_tx: None,

            network_status: Arc::new(Mutex::new(ConnectionState::Disconnected)),
            dispatcher_map: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

// on disconnect, the event loop must send a message to the UI and set a flag
// it should send the connected back

// User request to connect
#[tauri::command]
pub async fn connect_to_platform(
    address: &str,
    port: usize,
    on_connection_state: Channel<ConnectionState>,
    client: State<'_, Mutex<ClientState>>,
) -> Result<(), String> {
    println!("called connect on {}:{}", address, port);

    let mut client = client.lock().await;

    match *client.network_status.lock().await {
        ConnectionState::Connected => return Err("Already connected".into()),
        ConnectionState::Reconnecting => return Err("Already trying to reconnect".into()),
        _ => {}
    }

    let port: u16 = port
        .try_into()
        .map_err(|_| format!("Port {} is invalid", port))?;

    let (mut mqtt_client, shutdown_tx) = Mqtt::new(
        address,
        port,
        client.network_status.clone(),
        client.dispatcher_map.clone(),
        on_connection_state,
    );

    mqtt_client.try_connect().await?;

    client.mqtt_client = Some(mqtt_client.get_client());
    client.shutdown_tx = Some(shutdown_tx);

    *client.network_status.lock().await = ConnectionState::Connected;
    tokio::spawn(mqtt_client.start());
    Ok(())
}

// User asked to register an attribute
#[tauri::command]
pub async fn register_attribute(
    attribute_topic: &str,
    on_attribute_message: Channel<Bytes>,
    client: State<'_, Mutex<ClientState>>,
) -> Result<(), String> {
    let client = client.lock().await;

    if *client.network_status.lock().await != ConnectionState::Connected {
        return Err("Client not connected".into());
    }

    println!("called register_attribute on topic: {}", attribute_topic);

    let mut dispatcher = client.dispatcher_map.lock().await;
    dispatcher.insert(attribute_topic.to_string(), on_attribute_message);

    let _ = client
        .mqtt_client
        .as_ref()
        .unwrap()
        .subscribe(attribute_topic, QoS::AtLeastOnce)
        .await;
    Ok(())
}

// User asked to publish a value
#[tauri::command]
pub async fn publish(
    command_topic: &str,
    value: Bytes,
    client: State<'_, Mutex<ClientState>>,
) -> Result<(), String> {
    let client = client.lock().await;

    if *client.network_status.lock().await != ConnectionState::Connected {
        return Err("Client not connected".into());
    }

    let mqtt_client = client.mqtt_client.as_ref().unwrap();

    println!("Publishing on topic {:?} : {:?}", command_topic, value);

    let _ = mqtt_client
        .publish(command_topic, QoS::AtLeastOnce, false, value)
        .await;

    Ok(())
}

#[tauri::command]
pub async fn publish_file(
    command_topic: &str,
    path: String,
    _client: State<'_, Mutex<ClientState>>,
) -> Result<(), String> {
    use std::fs;

    println!("Publishing on file topic {:?} : {:?}", command_topic, path);

    //TODO: Binary file read
    //TODO: File chunking
    //TODO: Call publish with on platform file attribute topic (to be defined)
    match fs::read_to_string(&path) {
        Ok(contents) => {
            println!("{}", contents); // Just for debugging purposes
            Ok(())
        }
        Err(e) => Err(format!("Failed to read file: {}", e)),
    }
}

// User request to disconnect
#[tauri::command]
pub async fn disconnect_from_platform(client: State<'_, Mutex<ClientState>>) -> Result<(), ()> {
    println!("called disconnect");

    let mut client = client.lock().await;

    if let Some(shutdown) = client.shutdown_tx.take() {
        let _ = shutdown.send(ShutdownRequest);
    }

    client.mqtt_client = None;
    Ok(())
}
