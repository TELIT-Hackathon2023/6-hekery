import React from 'react';
import './App.css';
import PdfUpload from './components/PdfUpload';

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen flex flex-col justify-center items-center">
      <header className="text-4xl text-blue-600 mb-4">Welcome to Sales CoPilot</header>
      <PdfUpload />
    </div>
  );
}

export default App;
