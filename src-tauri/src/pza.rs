use rumqttc::*;
use tokio::task;
use std::time::Duration;

pub struct PzaCore {
    client: Option<AsyncClient>,
    event_loop_handle: Option<task::JoinHandle<()>>
}

impl PzaCore {
    pub fn new() -> PzaCore {
        Self {
            client: None,
            event_loop_handle: None
        }
    }

    pub async fn connect(&mut self) {
        let mut mqtt_options = MqttOptions::new("Hello", "localhost", 1883);

        mqtt_options.set_keep_alive(Duration::from_secs(10));

        let (client, mut event_loop) = AsyncClient::new(mqtt_options, 10);

        self.client = Some(client);

        self.event_loop_handle = Some(tokio::spawn(async move {
            loop {
                let event = event_loop.poll().await;

                match event {
                    Ok(v) => {
                        println!("wooooh {v:?}");
                    }
                    Err(e) => {
                        println!("nooo {e:?}");
                        return ;
                    }
                }
            }
        }));
    }

    pub fn is_connected(&self) -> bool {
        self.event_loop_handle.is_some()
    }

    pub async fn disconnect(&mut self) {
        if let Some(handle) = self.event_loop_handle.take() {
            handle.abort();
        }
        self.client = None;
    }
    
}
