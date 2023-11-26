import React, { useState,useEffect } from 'react';
import './App.css';
import PdfUpload from './components/PdfUpload';
import SummaryMain from './components/Summary/SummaryMain';
import MatchingScore from './components/Score/ScoreMain.jsx';
import MatchingDashboard from './components/Dashboard/DashboardMain.jsx';
import { SummaryProvider } from './context/SummaryContext.js';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles

function App() {
  const [activeTab, setActiveTab] = useState('summary'); // State to keep track of the active tab
  useEffect(() => {
    AOS.init({
      duration: 1000, // Global animation duration
      once: true, // Whether animation should happen only once - while scrolling down
    });
  }, []);

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
    <div data-aos="fade-right" className="App bg-white h-screen  w-full flex">
      <aside  className="w-1/4 bg-white shadow-xl">
      <PdfUpload  />
      </aside>
      <main className="w-3/4">
        <header className="flex w-full justify-between items-center p-4 shadow">
          <h1 className="text-4xl  text-white p-4 bg-[#e20274]">Sales CoPilot</h1>
          <nav>
            <button className="p-2 m-2 text-xl font-bold text-black hover:border-b-4 border-[#e20274]" onClick={() => setActiveTab('summary')}>Summary</button>
            <button className="p-2 m-2 text-xl font-bold text-black hover:border-b-4 border-[#e20274]" onClick={() => setActiveTab('matching-score')}>Matching Score</button>
            <button className="p-2 m-2 text-xl font-bold text-black hover:border-b-4 border-[#e20274]" onClick={() => setActiveTab('matching-dashboard')}>Matching Dashboard</button>
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
