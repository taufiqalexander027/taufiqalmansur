import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { SKPView } from './views/SKPView';
import { AssessmentView } from './views/AssessmentView';
import { UmumView } from './views/UmumView';
import { ViewState } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return <HomeView onChangeView={setCurrentView} />;
      case 'SKP':
        return <SKPView />;
      case 'BERAKHLAK':
        return <AssessmentView />;
      case 'UMUM':
        return <UmumView />;
      default:
        return <HomeView onChangeView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <Navbar
        currentView={currentView}
        onHomeClick={() => setCurrentView('HOME')}
      />

      <main>
        {renderView()}
      </main>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 no-print animate-fade-in">
        <div className="px-6 py-2 bg-white/80 backdrop-blur-md border border-white/40 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105 hover:bg-white/90">
          <span className="text-xs font-medium text-gray-500">© {new Date().getFullYear()}</span>
          <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            made by Taufiq Al Mansur
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;