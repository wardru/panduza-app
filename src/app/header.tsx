'use client';

import Image from 'next/image';
import PanduzaLogo from "../images/logo/logo_circle_black_blue_256.png";
import { invoke } from "@tauri-apps/api/core";

const Header = () => {

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
            <div className="text-gray-400 flex flex-shrink-0 flex-grow space-x-2">
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
            </div>
        </div>
    );
}

export default Header;
