import React from 'react';
import { Bot, User } from 'lucide-react';

const ChatBubble = ({ message, isUser, timestamp }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}>
      <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-accent-primary' : 'bg-accent-secondary'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
        
        {/* Message bubble */}
        <div className={`glass-card p-3 ${
          isUser 
            ? 'bg-accent-primary/20 border-accent-primary/30' 
            : 'bg-surface/60 border-white/10'
        }`}>
          <p className="text-sm text-white leading-relaxed">
            {message}
          </p>
          
          {/* Timestamp */}
          <div className={`text-xs text-gray-400 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
