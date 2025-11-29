import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Message, Role } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSendMessage(input);
        setInput('');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="h-16 border-b border-legal-100 flex items-center px-6 bg-white shadow-sm z-10">
        <h2 className="font-serif font-bold text-legal-800 text-xl">Tutor Session</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-legal-400 text-center px-8">
            <div className="w-16 h-16 bg-legal-50 rounded-full flex items-center justify-center mb-4">
              <Bot size={32} className="text-legal-500" />
            </div>
            <h3 className="font-serif text-lg font-medium text-legal-700 mb-2">Ready to master Cybersecurity Law?</h3>
            <p className="max-w-md">Upload your lecture notes in the "Material" tab, or just ask me about the CFAA, GDPR, or Data Breach Negligence.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'} max-w-4xl mx-auto w-full`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
              msg.role === Role.USER ? 'bg-legal-700 text-white' : 'bg-highlight text-legal-900'
            }`}>
              {msg.role === Role.USER ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div className={`rounded-xl p-4 shadow-sm max-w-[85%] ${
              msg.role === Role.USER 
                ? 'bg-legal-600 text-white' 
                : 'bg-legal-50 text-legal-900 border border-legal-100'
            }`}>
              <div className={msg.role === Role.USER ? '' : 'prose prose-sm max-w-none'}>
                {msg.role === Role.USER ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 max-w-4xl mx-auto w-full">
             <div className="w-8 h-8 rounded-full bg-highlight text-legal-900 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={16} />
            </div>
            <div className="bg-legal-50 border border-legal-100 rounded-xl p-4 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-legal-500" />
              <span className="text-sm text-legal-500 font-medium">Analyzing legal principles...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-legal-200">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the law or ask for an exam hypo..."
            className="w-full bg-legal-50 border border-legal-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-legal-400 focus:bg-white transition-all resize-none text-legal-800"
            rows={1}
            style={{ minHeight: '50px', maxHeight: '150px' }}
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2.5 p-2 bg-legal-800 text-white rounded-lg hover:bg-legal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center text-xs text-legal-400 mt-2">
          AI Tutor can make mistakes. Verify with your actual casebook.
        </p>
      </div>
    </div>
  );
};
