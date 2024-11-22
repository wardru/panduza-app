'use client';

import Header from './header';
import { PlatformProvider } from './platform';

const Main = () => {
  return (
    <PlatformProvider>
      <div className="bg-green-800 h-screen flex flex-col overflow-hidden">
        <Header />
      </div>
    </PlatformProvider>
  );
};

export default Main;
