import React, { useState } from 'react';
import './App.css';
import PdfUpload from './components/PdfUpload';
import SummaryMain from './components/Summary/SummaryMain';
import MatchingScore from './components/Score/ScoreMain.jsx';
import MatchingDashboard from './components/Dashboard/DashboardMain.jsx';
import { SummaryProvider } from './context/SummaryContext.js';

function App() {
  const [activeTab, setActiveTab] = useState('summary'); // State to keep track of the active tab
 
  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryMain />;
      case 'matching-score':
        return <MatchingScore />;
      case 'matching-dashboard':
        return <MatchingDashboard />;
      default:
        return null;
    }
  };

  return (
    <SummaryProvider>
    <div className="App bg-gray-100 min-h-screen flex">
      <aside className="w-1/4 bg-white shadow">
      <PdfUpload />
      </aside>
      <main className="w-3/4 pl-6">
        <header className="flex justify-between items-center p-4 shadow">
          <h1 className="text-4xl text-blue-600">Sales CoPilot</h1>
          <nav>
            <button className="p-2 m-2" onClick={() => setActiveTab('summary')}>Summary</button>
            <button className="p-2 m-2" onClick={() => setActiveTab('matching-score')}>Matching Score</button>
            <button className="p-2 m-2" onClick={() => setActiveTab('matching-dashboard')}>Matching Dashboard</button>
          </nav>
        </header>
        <div className="content mt-4">
          {renderContent()}
        </div>
      </main>
    </div>
    </SummaryProvider>
  );
}

export default App;
