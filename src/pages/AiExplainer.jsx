import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, MessageSquare, AlertCircle } from 'lucide-react';
import ChatBubble from '../components/ChatBubble.jsx';
import { callOpenRouterAPI, getSystemPrompt, getSuggestedPrompts, getApiKeyFromStorage } from '../utils/openrouterApi.js';

const AiExplainer = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedPrompts = getSuggestedPrompts();
  const apiKey = getApiKeyFromStorage();

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    if (!apiKey) {
      setError('Please set your OpenRouter API key in settings to use the AI Explainer.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: messageText.trim(),
      isUser: true,
      timestamp: formatTimestamp()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setError('');
    setIsLoading(true);

    try {
      const conversationMessages = [
        { role: 'system', content: getSystemPrompt() },
        ...messages.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: messageText.trim() }
      ];

      const aiResponse = await callOpenRouterAPI(conversationMessages, apiKey);

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false,
        timestamp: formatTimestamp()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || 'Failed to get response from AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handleSuggestedPrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Explainer</h1>
          <p className="text-gray-300">
            Ask questions about algorithmic bias, fairness, and ethical AI
          </p>
        </div>

        {!apiKey && (
          <div className="glass-card p-4 mb-6 border-l-4 border-yellow-400">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-medium mb-1">API Key Required</p>
                <p className="text-sm text-gray-300">
                  Please set your OpenRouter API key in settings to use the AI Explainer. 
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
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 glass-card p-6 mb-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
              <p className="text-gray-300 mb-6">
                Ask me anything about algorithmic bias, fairness metrics, or ethical AI
              </p>
              
              <div className="max-w-2xl mx-auto">
                <p className="text-sm text-gray-400 mb-4">Try asking:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedPrompts.slice(0, 6).map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      disabled={!apiKey}
                      className="text-left p-3 bg-surface/50 hover:bg-surface/70 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <p className="text-sm text-white">{prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent-secondary">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass-card p-3 bg-surface/60 border-white/10">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card p-4 mb-4 border-l-4 border-red-400">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-sm text-gray-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="glass-card p-4">
          {messages.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-400">
                {messages.length} messages in conversation
              </p>
              <button
                onClick={clearChat}
                className="text-sm text-accent-primary hover:text-accent-secondary transition-colors"
              >
                Clear chat
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  apiKey 
                    ? "Ask about algorithmic bias, fairness metrics, or ethical AI..." 
                    : "Set your API key in settings to start chatting..."
                }
                disabled={!apiKey || isLoading}
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={!apiKey || !inputMessage.trim() || isLoading}
              className="px-6 py-3 accent-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>

          {/* Suggested Prompts */}
          {messages.length === 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-3">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.slice(0, 4).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    disabled={!apiKey}
                    className="px-3 py-1 bg-surface/50 hover:bg-surface/70 rounded-full text-xs text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs text-gray-400">
          Powered by OpenRouter • Model: mistralai/mistral-7b-instruct
        </div>
      </div>
    </div>
  );
};

export default AiExplainer;
