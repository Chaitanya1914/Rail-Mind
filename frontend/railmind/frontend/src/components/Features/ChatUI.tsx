'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function ChatUI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://weak-terms-wait.loca.lt/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'railmind-hackathon-2026',
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const data = await response.json();
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat API Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Error: Could not connect to AI server. Please check connection.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[300px] bg-[#0d1117] rounded-xl border border-white/5 shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <Bot size={16} className="text-cyan-400" />
        <span className="text-[12px] font-bold text-slate-300 uppercase tracking-wider">
          AI Assistant
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-slate-500 italic flex items-center justify-center h-full text-xs">
            Ask the AI about the railway network...
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div
                className={`px-3 py-2 rounded-lg text-[12px] max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-indigo-500/10 text-indigo-100 border border-indigo-500/20 rounded-tr-none'
                    : 'bg-cyan-500/10 text-cyan-100 border border-cyan-500/20 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Bot size={12} />
            </div>
            <div className="px-3 py-2 rounded-lg text-[12px] bg-cyan-500/10 text-cyan-100 border border-cyan-500/20 rounded-tl-none flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-cyan-400" />
              <span className="text-cyan-400/80 animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#161b22] border-t border-[#30363d]">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question..."
            disabled={isLoading}
            className="flex-1 bg-[#0a0e1a] text-slate-200 text-xs px-3 py-2 rounded-md border border-white/10 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-cyan-500/20 text-cyan-400 p-2 rounded-md hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-cyan-500/20 flex items-center justify-center shrink-0"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>
    </div>
  );
}
