use rumqttc::{AsyncClient, ConnectionError, Event, EventLoop, Incoming, MqttOptions, QoS, ConnectReturnCode};
use core::str;
use std::time::Duration;
use tokio::{task, sync::mpsc, time::timeout, time};
use uuid::Uuid;
use tokio::sync::Mutex;
use std::sync::Arc;

pub type MqttMessage = (String, String);

#[derive(Debug)]
pub enum MqttMessageType
{
    Publish(MqttMessage),
    Subscribe(String),
    Unsubscribe(String)
}

pub struct MqttHandler {
    rumqtt_client: Option<Arc<Mutex<AsyncClient>>>,
    connection_timeout: std::time::Duration,

    message_provider_tx: mpsc::Sender<MqttMessageType>,
    
    event_loop_handle: Option<task::JoinHandle<()>>,
    message_loop_handle: Option<task::JoinHandle<()>>,
}

impl MqttHandler {

    pub fn new() -> Self {

        let (provider_tx, _provider_rx) = mpsc::channel(42);

        Self {
            rumqtt_client: None,
            connection_timeout: Duration::from_secs(3),

            message_provider_tx: provider_tx,

            event_loop_handle: None,
            message_loop_handle: None,
        }
    }

    pub async fn connect<T>(
        &mut self,
        address: T,
        port: u16,
    ) -> Result<(mpsc::Receiver<MqttMessage>, mpsc::Receiver<Result<String, ConnectionError>>), ConnectionError>
    where
        T: Into<String>,
    {
        if self.rumqtt_client.is_some() {
            return Err(ConnectionError::ConnectionRefused(ConnectReturnCode::ServiceUnavailable));
        }

        let mut mqtt_options = MqttOptions::new(Uuid::new_v4(), address, port);
        mqtt_options.set_keep_alive(Duration::from_secs(5));
        let (client, eventloop) = AsyncClient::new(mqtt_options, 100);

        self.rumqtt_client = Some(Arc::new(Mutex::new(client)));

        let (message_provider_tx, message_provider_rx) = mpsc::channel(42);
        let (message_dispatcher_tx, message_dispatcher_rx) = mpsc::channel(42);
        let (connection_state_tx, mut connection_state_rx) = mpsc::channel(10);
        
        self.message_provider_tx = message_provider_tx;

        self.event_loop_handle = Some(task::spawn(Self::run_event_loop(eventloop, connection_state_tx, message_dispatcher_tx)));
        self.message_loop_handle = Some(task::spawn(Self::run_message_loop(self.rumqtt_client.as_ref().unwrap().clone(), message_provider_rx)));

        timeout(self.connection_timeout, async {
            loop {
                match connection_state_rx.recv().await {
                    Some(Ok(msg)) if msg == "Connected" => return Ok(()),
                    Some(Err(e)) => return Err(e),
                    _ => {}
                }
            }
        }).await.map_err(|_| ConnectionError::NetworkTimeout)??;

        Ok((message_dispatcher_rx, connection_state_rx))
    }

    async fn run_message_loop(client: Arc<Mutex<AsyncClient>>, mut message_receiver: mpsc::Receiver<MqttMessageType>) {
        while let Some(msg) = message_receiver.recv().await {
            println!("Wooh we got an order! {:?}", msg);
            let client = client.lock().await;

            match msg {
                MqttMessageType::Publish(m) => {
                   client.publish(m.0, QoS::AtLeastOnce, false, m.1).await.unwrap_or_else(|e| println!("Could not publish: {e:?}"));
                }
                MqttMessageType::Subscribe(t) => {
                    client.subscribe(t, QoS::AtLeastOnce).await.unwrap_or_else(|e| println!("Could not subscribe: {e:?}"));
                }
                MqttMessageType::Unsubscribe(t) => {
                    client.unsubscribe(t).await.unwrap_or_else(|e| println!("Could not unsubscribe: {e:?}"));
                }
            }
        }
    }

    async fn run_event_loop(mut eventloop: EventLoop, state_tx: mpsc::Sender<Result<String, ConnectionError>>, dispatcher_tx: mpsc::Sender<MqttMessage>) {
        loop {
            let event = eventloop.poll().await;
            
            match event {
                Ok(Event::Incoming(Incoming::ConnAck(_))) => {
                    state_tx.send(Ok("Connected".into())).await.unwrap_or_else(|e| println!("Could not send: {e:?}"));
                }
                Ok(Event::Incoming(Incoming::Disconnect)) => {
                    state_tx.send(Ok("Disconnected".into())).await.unwrap_or_else(|e| println!("Could not send: {e:?}"));
                }
                Ok(Event::Incoming(Incoming::Publish(m))) => {
                    dispatcher_tx.send((m.topic, str::from_utf8(&m.payload).clone().unwrap().to_string())).await.unwrap_or_else(|e| println!("Could not send: {e:?}"));
                }
                Err(e) => {
                    state_tx.send(Err(e)).await.unwrap_or_else(|m| println!("Could not send: {m:?}"));
                    time::sleep(Duration::from_secs(1)).await;
                }
                _ => {}
            }
        }
    }

    pub async fn disconnect(&mut self) {
        if let Some(client) = &self.rumqtt_client {
            client.lock().await.disconnect().await.unwrap_or_else(|e| println!("Could not disconnect: {e:?}"));
            self.event_loop_handle.as_ref().unwrap().abort();
            self.message_loop_handle.as_ref().unwrap().abort();
            self.rumqtt_client = None;
        }
        else {
            println!("Can't disconnect, client is not connected");
        }
    }

    pub fn get_message_provider(&self) -> mpsc::Sender<MqttMessageType> {
        self.message_provider_tx.clone()
    }
}
