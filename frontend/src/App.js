import React from 'react';
import './App.css';
import PdfUpload from './components/PdfUpload';
// Import other components for Summary, Matching Score, and Dashboard

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen flex">
      <aside className="w-1/4">
        <PdfUpload />
      </aside>
      <main className="w-3/4 p-4">
        <header className="text-4xl text-blue-600 mb-4">Sales CoPilot</header>
        {/* Placeholder for the tabbed content area */}
        {/* You will need to create components for Summary, Matching Score, and Dashboard */}
        <div>
          {/* Replace these divs with actual components */}
          <div id="summary-tab">Summary Content</div>
          <div id="matching-score-tab">Matching Score Content</div>
          <div id="matching-dashboard-tab">Matching Dashboard Content</div>
        </div>
      </main>
    </div>
  );
}

export default App;
