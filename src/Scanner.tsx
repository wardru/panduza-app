import './App.css';
import { invoke, Channel } from '@tauri-apps/api/core';
import { useState } from 'react';

const Scanner = () => {
    const [result, setResult] = useState('');
    let active = false;

    const onScanResult = (message: Uint8Array) => {
        const str = new TextDecoder('utf-8').decode(new Uint8Array(message));
        const json = JSON.parse(str);

        setResult(JSON.stringify(json, null, 2));
    };

    const handleClick = () => {
        const channel = new Channel<Uint8Array>();
        channel.onmessage = onScanResult;
        if (active == false) {
            invoke('register_attribute', { attributeTopic: 'pza/_/scanner/result/att', onAttributeMessage: channel })
                .then(() => {
                    active = true;
                })
                .catch((e) => {
                    setResult(e);
                    active = false;
                });
        }
        invoke('publish', { commandTopic: 'pza/_/scanner/running/cmd', value: 'true' }).catch((e) => {
            setResult(e);
        });
    };

    return (
        <div className='disable-select theme-dark bg-neutral-900 text-primary h-screen w-screen flex items-center justify-center'>
            <div className='flex flex-col items-center m- h-full w-full  p-2'>
                <button
                    className='bg-green-400 w-min py-1 px-6 rounded-md m-2 text-black hover:bg-neutral-600'
                    onClick={handleClick}
                >
                    Scan
                </button>

                <textarea
                    className='bg-black w-full h-full flex-1 p-2 border-orange-600 border  focus:outline-none'
                    readOnly={true}
                    value={result}
                ></textarea>
            </div>
        </div>
    );
};

export default Scanner;
