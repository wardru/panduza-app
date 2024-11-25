'use client';

import { PlatformProvider } from './platform';
import Header from './header';
import TreeView from './treeview';
import { Allotment } from 'allotment';
import "allotment/dist/style.css";

const Main = () => {
  return (
    <PlatformProvider>
      <div className="bg-green-800 h-screen flex flex-col overflow-hidden">
        <Header />
        <Allotment defaultSizes={[100, 200]}>
          <TreeView/>
        </Allotment>
      </div>
    </PlatformProvider>
  );
};

export default Main;
