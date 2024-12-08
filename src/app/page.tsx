'use client';

import { Allotment } from 'allotment';
import "allotment/dist/style.css";

import { PlatformProvider } from './platform';
import Header from './header';
import TreePanel from './tree';
import ControlPanel from './control';

const Main = () => {
  return (
    <PlatformProvider>
      <div className="bg-black h-screen flex flex-col overflow-hidden">
        <Header />
        <Allotment defaultSizes={[1, 3]}>
          <TreePanel/>
          <ControlPanel/>
        </Allotment>
      </div>
    </PlatformProvider>
  );
};

export default Main;
