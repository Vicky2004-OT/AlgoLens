import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ApiKeyModal from './components/ApiKeyModal.jsx';
import Home from './pages/Home.jsx';
import BiasPlayground from './pages/BiasPlayground.jsx';
import DatasetStudio from './pages/DatasetStudio.jsx';
import WhatIfAnalyzer from './pages/WhatIfAnalyzer.jsx';
import FairnessMetrics from './pages/FairnessMetrics.jsx';
import AiExplainer from './pages/AiExplainer.jsx';
import BiasReport from './pages/BiasReport.jsx';
import { getApiKeyFromStorage } from './utils/openrouterApi.js';

function App() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Check for API key on first load
  useEffect(() => {
    const apiKey = getApiKeyFromStorage();
    if (!apiKey) {
      // Show modal after a short delay to let user see app first
      const timer = setTimeout(() => {
        setIsSettingsModalOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

 return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar onSettingsClick={() => setIsSettingsModalOpen(true)} />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playground" element={<BiasPlayground />} />
            <Route path="/dataset" element={<DatasetStudio />} />
            <Route path="/analyzer" element={<WhatIfAnalyzer />} />
            <Route path="/metrics" element={<FairnessMetrics />} />
            <Route path="/explainer" element={<AiExplainer />} />
            <Route path="/report" element={<BiasReport />} />
          </Routes>
        </main>

        <ApiKeyModal 
          isOpen={isSettingsModalOpen} 
          onClose={() => setIsSettingsModalOpen(false)} 
        />
      </div>
    </Router>
  );
}

export default App;
