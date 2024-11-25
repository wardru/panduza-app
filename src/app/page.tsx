'use client';

import { Allotment } from 'allotment';
import "allotment/dist/style.css";

import { PlatformProvider } from './platform';
import Header from './header';
import TreePanel from './tree';
import ControlPanel from './control';
import NoderPanel from './noder';

const Main = () => {
  return (
    <PlatformProvider>
      <div className="bg-green-800 h-screen flex flex-col overflow-hidden">
        <Header />
        <Allotment defaultSizes={[1, 3]}>
          <TreePanel/>
          <div className="h-full w-full">
            <Allotment vertical={true} defaultSizes={[3, 2]}>
              <ControlPanel/>
              <NoderPanel/>
            </Allotment>
          </div>
        </Allotment>
      </div>
    </PlatformProvider>
  );
};

export default Main;
