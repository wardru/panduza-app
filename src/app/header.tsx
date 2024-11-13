'use client';

import Image from 'next/image';
import PanduzaLogo from "../images/logo/logo_circle_black_blue_256.png";
import { invoke } from "@tauri-apps/api/core";
import { listen } from '@tauri-apps/api/event';
import {useState, useEffect} from 'react';

const Header = () => {


        useEffect(() => {
        console.log("meh");

        // Listen for the 'connect' event to update connection status
            listen<string>('connect', (event) => {
                if (event.payload === 'true') {
                    setIsConnected(true);  // Set to true if 'connect' is successful
                } else {
                    setIsConnected(false); // Set to false if 'connect' fails
                }
            });
    }, []);
     
    const [isConnected, setIsConnected] = useState(false); // Track connection status

    const handleConnect = () => {
        invoke("connect").then((response) => {
            // Assuming the response is a boolean or something that indicates success/failure
            if (response === true) {
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        });
    };

    const handleDisconnect = () => {
        invoke("disconnect");
        setIsConnected(false); // Set to false when disconnected
    };

    return (
        <div className="bg-header sticky top-0 flex py-1"> {/* Adjusted padding for more height */}
            <div className="flex-shrink-0 ml-2 mr-5" > {/* Ensures the logo doesn’t shrink */}
                <Image
                    src={PanduzaLogo}
                    width={27}
                    height={27}
                    alt="logo"
                />
            </div>
            <div className="text-gray-400 flex flex-shrink-0 flex-grow space-x-2 items-center">
                <button className="text-primary hover:bg-slate-500 px-4 rounded-lg"
                    onClick={() => invoke("connect").then(() => console.log("yepaa"))}
                >
                    Connect
                </button>
                <button className="text-primary hover:bg-slate-500 px-4 rounded-lg"
                    onClick={() => invoke("disconnect")}
                >
                   Disconnect 
                </button>

                <div
                    className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                />

            </div>
        </div>
    );
}

export default Header;
