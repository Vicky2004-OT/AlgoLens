import React, { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { getApiKeyFromStorage, saveApiKeyToStorage, validateApiKey } from '../utils/openrouterApi.js';

const ApiKeyModal = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const existingKey = getApiKeyFromStorage();
      if (existingKey) {
        setApiKey(existingKey);
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    if (!validateApiKey(apiKey)) {
      setError('Invalid API key format. OpenRouter keys typically start with "sk-or-v1-"');
      return;
    }

    setIsSaving(true);

    try {
      const saved = saveApiKeyToStorage(apiKey);
      if (saved) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError('Failed to save API key. Please check your browser settings.');
      }
    } catch (err) {
      setError('An error occurred while saving the API key.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove the API key?')) {
      try {
        localStorage.removeItem('algolens_api_key');
        setApiKey('');
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } catch (err) {
        setError('Failed to remove API key.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-accent-primary" />
            <h2 className="text-xl font-semibold">OpenRouter API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-300 text-sm mb-4">
              Enter your OpenRouter API key to enable AI-powered features in AlgoLens.
              You can get a free key from{' '}
              <a 
                href="https://openrouter.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent-primary hover:underline"
              >
                openrouter.ai
              </a>
            </p>
            
            <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-3">
              <p className="text-xs text-accent-primary">
                <strong>Note:</strong> Your API key is stored locally in your browser and is never shared with our servers.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center space-x-2 text-green-400 text-sm">
              <Check className="w-4 h-4" />
              <span>API key saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent pr-12"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 accent-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Key'}
              </button>
              
              {getApiKeyFromStorage() && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                >
                  Remove
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
