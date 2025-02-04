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
        <div className='disable-select theme-dark flex h-screen w-screen items-center justify-center bg-neutral-900'>
            <div className='m- flex h-full w-full flex-col items-center p-2'>
                <button
                    className='bg-active hover:bg-active-hover m-2 w-min rounded-md px-6 py-1'
                    onClick={handleClick}
                >
                    Scan
                </button>

                <textarea
                    className='border-active bg-background h-full w-full flex-1 resize-none border p-2 focus:outline-hidden'
                    readOnly={true}
                    value={result}
                ></textarea>
            </div>
        </div>
    );
};

export default Scanner;
