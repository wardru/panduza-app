'use client';

import Header from './header';
import Tree from './tree';

const Main = () => {
  return (
    <div className="bg-green-800 h-screen flex flex-col overflow-hidden">
      <Header />
      <Tree />
    </div>
  );
};

export default Main;
