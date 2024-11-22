import { invoke, Channel } from '@tauri-apps/api/core';

interface MqttMessage {
    topic: string,
    payload: Uint8Array 
}

export async function register_platform_driver() {
    const onDriverMessage = new Channel<MqttMessage>;

    onDriverMessage.onmessage = (message) => {
        
        const str = String.fromCharCode(...message.payload);
        console.log(str);
    }

    await invoke('register_driver', { driverName: "_", attributeList: ["structure"], onDriverMessage });
}
