'use client';

import Header from './header';
import { ClientProvider } from './client';

const Main = () => {
  return (
    <ClientProvider>
      <div className="bg-green-800 h-screen flex flex-col overflow-hidden">
        <Header />
      </div>
    </ClientProvider>
  );
};

export default Main;
