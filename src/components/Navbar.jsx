import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Menu, X, Brain } from 'lucide-react';
import { getApiKeyFromStorage } from '../utils/openrouterApi.js';

const Navbar = ({ onSettingsClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const apiKey = getApiKeyFromStorage();
    setHasApiKey(!!apiKey);
  }, []);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/playground', label: 'Bias Playground' },
    { path: '/dataset', label: 'Dataset Studio' },
    { path: '/analyzer', label: 'What-If Analyzer' },
    { path: '/metrics', label: 'Fairness Metrics' },
    { path: '/explainer', label: 'AI Explainer' },
    { path: '/report', label: 'Bias Report' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-surface/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-accent-primary" />
            <span className="text-xl font-bold gradient-text">AlgoLens</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-accent-primary'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Settings Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 relative"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-300" />
              {!hasApiKey && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors duration-200 px-2 py-1 rounded ${
                    isActive(item.path)
                      ? 'text-accent-primary bg-accent-primary/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
