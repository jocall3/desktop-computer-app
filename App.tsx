import React, { useState } from 'react';
import { DesktopView } from './components/desktop/DesktopView';
import { ViewType } from './types';

const App = () => {
  // Simple navigation state, mostly handled by DesktopView internally or for external routing if needed
  const [currentView, setCurrentView] = useState<ViewType>('login');

  const handleNavigate = (view: ViewType, props?: any) => {
    console.log(`Navigating to ${view}`, props);
    setCurrentView(view);
  };

  return (
    <div className="w-screen h-screen bg-gray-900 text-white overflow-hidden">
      <DesktopView onNavigate={handleNavigate} />
    </div>
  );
};

export default App;