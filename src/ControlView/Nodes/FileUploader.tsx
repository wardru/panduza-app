import React, { useState, useEffect } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';

import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

import { NodeProps } from '@xyflow/react';

import NodeShell from '../NodeShell';

import { usePlatform, ConnectionState } from '../../platform';

const FileUploader: React.FC<NodeProps> = (props) => {
    //TODO: refactor with useAttributeListener once file uploader attribute is defined

    const [lastFileUploaded, setLastFileUploaded] = useState<string | null>(null);
    const [disabled, setIsDisabled] = useState(false);
    const platform = usePlatform();

    useEffect(() => {
        setIsDisabled(platform.connectionState !== ConnectionState.Connected);
    }, [platform.connectionState]);

    const openFileAndSendToBackend = async () => {
        try {
            // Open file dialog
            const filePath = await open({
                multiple: false, // Only allow one file selection
                directory: false, // And no directories
            });

            if (filePath) {
                console.log('Selected file:', filePath);

                // Send file path to backend for processing
                await invoke('publish_file', {
                    commandTopic: 'TBD',
                    path: filePath,
                });

                const fileName = filePath.split(/[\\/]/).pop() ?? null; //Simpler path.basename() didn't work on windows
                setLastFileUploaded(fileName);
            } else {
                console.log('No file selected');
            }
        } catch (error) {
            setLastFileUploaded(null);
            console.error('Error:', error);
        }
    };

    return (
        <NodeShell
            topLeft={'File uploader'}
            topRight={'TBD'}
            bottomRight={'TBD'}
            selected={props.selected || false}
            disabled={disabled}
        >
            <div
                className='flex flex-col items-center justify-center text-lg hover:text-gray-300'
                onClick={openFileAndSendToBackend}
            >
                <CloudArrowUpIcon className='size-12' />
                {lastFileUploaded ? <label>{lastFileUploaded}</label> : <label>Select a file</label>}
            </div>
        </NodeShell>
    );
};

export default FileUploader;
