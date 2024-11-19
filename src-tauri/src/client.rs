use std::time::Duration;

use bytes::Bytes;
use rumqttc::{AsyncClient, ConnectionError, Event, EventLoop, Incoming, MqttOptions, Outgoing};
use uuid::Uuid;

use tokio::sync::Mutex;
use tokio::sync::{mpsc, oneshot, watch};
use tokio::task;
use tokio::time;

use futures::future;

use futures::future::FutureExt;

use std::sync::Arc;

use std::collections::HashMap;

use tauri::{ipc::Channel, State};
use serde::Serialize;

pub struct ShutdownRequest;

pub struct MqttMessage {
    topic: String,
    payload: Bytes,
}

#[derive(Clone, Serialize)]

pub enum ConnectionState {
    Connected,
    Reconnecting,
    Disconnected
}

struct Mqtt {
    client: AsyncClient,
    event_loop: EventLoop,
    network_status: Arc<Mutex<ConnectionState>>,
    dispatcher_map: Arc<Mutex<HashMap<String, Channel<MqttMessage>>>>,
    event_sender: Channel<ConnectionState>,

    shutdown_rx: oneshot::Receiver<ShutdownRequest>,
}

impl Mqtt {
    fn new(
        address: String,
        port: u16,
        network_status: Arc<Mutex<ConnectionState>>,
        dispatcher_map: Arc<Mutex<HashMap<String, Channel<MqttMessage>>>>,
        event_sender: Channel<ConnectionState>,
    ) -> (Mqtt, oneshot::Sender<ShutdownRequest>) {
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

    async fn start(mut self) {
        let mut shutdown_rx = self.shutdown_rx.fuse();
        let mut need_retry_timeout: bool = false;

        loop {
            tokio::select! {
                event = self.event_loop.poll(), if need_retry_timeout == false => {

                    match event {
                        Ok(Event::Incoming(Incoming::ConnAck(_))) => {
                            *self.network_status.lock().await = ConnectionState::Connected;
                            let _ = self.event_sender.send(ConnectionState::Connected);
                            println!("connecting succeded");
                        }
                        Err(e) => {
                            println!("connecting failed, setting wait");
                            *self.network_status.lock().await = ConnectionState::Reconnecting;
                            let _ = self.event_sender.send(ConnectionState::Reconnecting);
                            need_retry_timeout = true;
                        }
                        _ => {}
                    }
                }

                _ = &mut shutdown_rx => {
                    *self.network_status.lock().await = ConnectionState::Disconnected;
                    println!("Shutting down!");
                    break ;
                }

                _ = async {
                    if need_retry_timeout == true {
                        println!("will wait");
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
    sender_map: Arc<Mutex<HashMap<String, Channel<MqttMessage>>>>
}

impl ClientState {
    pub fn new() -> ClientState {
        Self {
            mqtt_client: None,
            shutdown_tx: None,

            network_status: Arc::new(Mutex::new(ConnectionState::Disconnected)),
            sender_map: Arc::new(Mutex::new(HashMap::new()))
        }
    }
}

// on disconnect, the event loop must send a message to the UI and set a flag
// it should send the connected back

// User request to connect
#[tauri::command]
pub async fn connect_to_platform(
    address: String,
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
    
    //todo: proper error on bad port
    let port: u16 = port.try_into()
        .map_err(|_| format!("Port {} is invalid", port))?;

    let (mqtt_client, shutdown_tx) = Mqtt::new(address, port, client.network_status.clone(), client.sender_map.clone(), on_connection_state);

    client.mqtt_client = Some(mqtt_client.get_client());
    client.shutdown_tx = Some(shutdown_tx);

    tokio::spawn(mqtt_client.start());

    Ok(())
}

// User asked to register a driver
#[tauri::command]
pub async fn register_driver(
    base_topic: String,
    topic_list: Vec<String>,
    sender: Channel<MqttMessage>,
) -> Result<(), ()> {
    // check if connected
    // add the sender to the event loop  based on base_topic
    // subscribe to the topic list

    Ok(())
}

// User request to disconnect
#[tauri::command]
pub async fn disconnect_from_platform(client: State<'_, Mutex<ClientState>>) -> Result<(), String> {
    println!("called disconnect");
    
    let mut client = client.lock().await;

    if let Some(shutdown) = client.shutdown_tx.take() {
        let _ = shutdown.send(ShutdownRequest);
    }

    client.mqtt_client = None;
    Ok(())
}
